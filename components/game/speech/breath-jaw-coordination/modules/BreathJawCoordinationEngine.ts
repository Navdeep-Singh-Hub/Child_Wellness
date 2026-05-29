import type {
  BreathJawCoordinationAnalytics,
  BreathJawCoordinationDifficulty,
  BreathJawCoordinationGameId,
  BreathJawCoordinationSnapshot,
  BreathJawRewardState,
  JawApproximation,
} from './breathJawCoordinationTypes';

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function avg(nums: number[]) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

const WINDOW = 5;
const JAW_SEQUENCE: JawApproximation[] = ['OPEN', 'CLOSED', 'PARTIAL_OPEN', 'OPEN'];

export class BreathJawCoordinationEngine {
  readonly gameId: BreathJawCoordinationGameId;
  private difficulty: BreathJawCoordinationDifficulty = 'easy';

  private startMs = Date.now();
  private lastMs = this.startMs;
  private lastInteractionMs = this.startMs;

  private state: BreathJawCoordinationSnapshot['state'] = 'IDLE';
  private rewardState: BreathJawRewardState = 'NONE';
  private coordinationPulse = false;
  private helperVisible = false;
  private helperCount = 0;

  private airflowAttempt = 0;
  private coordinationAttempt = 0;
  private sequenceStep = 0;
  private sequenceLength = 2;
  private progress = 0;
  private engagement = 0.2;

  private jawApproximation: JawApproximation = 'OPEN';
  private jawHint = 'Jaw open softly';
  private airHint = 'Soft air';

  private baseline = 0.03;
  private threshold = 0.11;
  private smoothedLevel = 0;
  private levelBuffer: number[] = [];
  private airflowActive = false;
  private airflowStartMs: number | null = null;

  constructor(gameId: BreathJawCoordinationGameId) {
    this.gameId = gameId;
    if (gameId === 'robot-air-mouth-switch') this.sequenceLength = 2;
    if (gameId === 'breath-jaw-hero') this.sequenceLength = 3;
  }

  configure(difficulty: BreathJawCoordinationDifficulty) {
    this.difficulty = difficulty;
    if (this.gameId === 'breath-jaw-hero') this.sequenceLength = difficulty === 'easy' ? 2 : 3;
    const margin = difficulty === 'easy' ? 0.05 : difficulty === 'medium' ? 0.075 : 0.1;
    this.threshold = this.baseline + margin;
  }

  reset() {
    this.startMs = Date.now();
    this.lastMs = this.startMs;
    this.lastInteractionMs = this.startMs;
    this.state = 'IDLE';
    this.rewardState = 'NONE';
    this.coordinationPulse = false;
    this.helperVisible = false;
    this.helperCount = 0;
    this.airflowAttempt = 0;
    this.coordinationAttempt = 0;
    this.sequenceStep = 0;
    this.progress = 0;
    this.engagement = 0.2;
    this.jawApproximation = 'OPEN';
    this.jawHint = 'Jaw open softly';
    this.airHint = 'Soft air';
    this.smoothedLevel = 0;
    this.levelBuffer = [];
    this.airflowActive = false;
    this.airflowStartMs = null;
  }

  setCue(jaw: JawApproximation, jawHint: string, airHint: string) {
    this.jawApproximation = jaw;
    this.jawHint = jawHint;
    this.airHint = airHint;
    this.state = 'SHOWING_PROMPT';
    this.helperVisible = false;
  }

  showPrompt() {
    const idx = this.coordinationAttempt % JAW_SEQUENCE.length;
    const jaw = JAW_SEQUENCE[idx] ?? 'OPEN';
    this.setCue(jaw, this.defaultJawHint(jaw), 'Soft blow or mouth move counts');
  }

  private defaultJawHint(jaw: JawApproximation) {
    switch (jaw) {
      case 'CLOSED':
        return 'Close jaw softly';
      case 'PARTIAL_OPEN':
        return 'Partly open jaw';
      default:
        return 'Open jaw gently';
    }
  }

  process(rawLevel: number, now = Date.now()): BreathJawCoordinationSnapshot {
    if (this.state === 'IDLE') this.state = 'SHOWING_PROMPT';

    const level = clamp01(rawLevel);
    this.levelBuffer.push(level);
    if (this.levelBuffer.length > WINDOW) this.levelBuffer.shift();
    this.smoothedLevel = avg(this.levelBuffer);

    const generous = this.difficulty === 'easy' ? 0.025 : 0.04;
    const active =
      this.smoothedLevel > this.threshold ||
      level > this.threshold * 0.85 ||
      this.smoothedLevel > this.baseline + generous;

    if (active && !this.airflowActive) {
      this.airflowActive = true;
      this.airflowStartMs = now;
      this.state = 'AIRFLOW_ACTIVE';
    } else if (!active && this.airflowActive) {
      const duration = this.airflowStartMs != null ? now - this.airflowStartMs : 0;
      this.airflowActive = false;
      this.airflowStartMs = null;
      if (duration >= 220) {
        this.recordAttempt(now);
      } else {
        this.state = 'WAITING_FOR_ATTEMPT';
      }
    }

    const idleMs = now - this.lastInteractionMs;
    const helperDelay = this.difficulty === 'easy' ? 3600 : this.difficulty === 'medium' ? 4200 : 4700;
    if (idleMs > helperDelay && !this.helperVisible) {
      this.helperVisible = true;
      this.helperCount += 1;
      this.state = 'HELPING';
    }
    if (this.helperVisible && idleMs < 900) {
      this.helperVisible = false;
      if (this.state === 'HELPING') this.state = 'WAITING_FOR_ATTEMPT';
    }

    const dt = Math.max(0, now - this.lastMs);
    this.lastMs = now;
    this.engagement = clamp01(this.engagement + dt * 0.0001);
    return this.snapshot(now);
  }

  coordinate(now = Date.now()) {
    this.recordAttempt(now);
  }

  goodTry(now = Date.now()) {
    this.recordAttempt(now);
    this.triggerReward('SPARKLE');
  }

  private recordAttempt(now: number) {
    this.airflowAttempt += 1;
    this.coordinationAttempt += 1;
    this.lastInteractionMs = now;
    this.helperVisible = false;
    this.engagement = clamp01(this.engagement + (this.engagement < 0.7 ? 0.07 : 0.035));

    this.sequenceStep = Math.min(this.sequenceLength, this.sequenceStep + 1);
    this.progress = clamp01(this.sequenceStep / this.sequenceLength);
    this.state = 'AIRFLOW_ACTIVE';

    const rewardEvery = this.difficulty === 'easy' ? 1 : this.difficulty === 'medium' ? 2 : 3;
    if (this.airflowAttempt % rewardEvery === 0 || this.sequenceStep >= this.sequenceLength) {
      this.triggerReward(this.progress >= 0.95 ? 'HERO' : this.progress >= 0.5 ? 'STAR' : 'SPARKLE');
      if (this.sequenceStep >= this.sequenceLength) this.sequenceStep = 0;
    } else {
      this.state = 'WAITING_FOR_ATTEMPT';
    }
    this.showPrompt();
  }

  triggerReward(kind: BreathJawRewardState) {
    this.rewardState = kind;
    this.coordinationPulse = true;
    this.state = 'REWARDING';
  }

  consumeCoordinationPulse() {
    if (!this.coordinationPulse) return false;
    this.coordinationPulse = false;
    if (this.state === 'REWARDING') this.state = 'WAITING_FOR_ATTEMPT';
    return true;
  }

  private snapshot(now: number): BreathJawCoordinationSnapshot {
    return {
      state: this.state,
      airflowAttempt: this.airflowAttempt,
      coordinationAttempt: this.coordinationAttempt,
      jawApproximation: this.jawApproximation,
      engagementLevel: this.engagement,
      rewardState: this.rewardState,
      coordinationPulse: this.coordinationPulse,
      helperVisible: this.helperVisible,
      engagementTimeMs: now - this.startMs,
      airflowActive: this.airflowActive,
      smoothedLevel: this.smoothedLevel,
      jawHint: this.jawHint,
      airHint: this.airHint,
    };
  }

  getAnalytics(gameCompletion = 0): BreathJawCoordinationAnalytics {
    return {
      engagementTimeMs: Date.now() - this.startMs,
      airflowAttempts: this.airflowAttempt,
      coordinationAttempts: this.coordinationAttempt,
      gameCompletion,
      sequenceProgress: this.progress,
      helperCount: this.helperCount,
      lastUpdated: Date.now(),
    };
  }
}
