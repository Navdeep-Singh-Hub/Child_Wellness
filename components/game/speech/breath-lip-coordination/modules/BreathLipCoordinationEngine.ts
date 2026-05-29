import type {
  BreathLipCoordinationAnalytics,
  BreathLipCoordinationDifficulty,
  BreathLipCoordinationGameId,
  BreathLipCoordinationSnapshot,
  BreathLipRewardState,
  LipApproximation,
} from './breathLipCoordinationTypes';

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function avg(nums: number[]) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

const WINDOW = 5;

const LIP_SEQUENCE: LipApproximation[] = ['ROUNDED', 'OPEN', 'SPREAD', 'PARTIAL_OPEN', 'CLOSED'];

export class BreathLipCoordinationEngine {
  readonly gameId: BreathLipCoordinationGameId;
  private difficulty: BreathLipCoordinationDifficulty = 'easy';

  private startMs = Date.now();
  private lastMs = this.startMs;
  private lastInteractionMs = this.startMs;

  private state: BreathLipCoordinationSnapshot['state'] = 'IDLE';
  private rewardState: BreathLipRewardState = 'NONE';
  private coordinationPulse = false;
  private helperVisible = false;
  private helperCount = 0;

  private airflowAttempt = 0;
  private coordinationAttempt = 0;
  private sequenceStep = 0;
  private sequenceLength = 2;
  private progress = 0;
  private engagement = 0.2;

  private lipApproximation: LipApproximation = 'OPEN';
  private lipHint = 'Lips open softly';
  private airHint = 'Soft air';

  private baseline = 0.03;
  private threshold = 0.11;
  private smoothedLevel = 0;
  private levelBuffer: number[] = [];
  private airflowActive = false;
  private airflowStartMs: number | null = null;
  private lastStopIntensity = 0;

  constructor(gameId: BreathLipCoordinationGameId) {
    this.gameId = gameId;
    if (gameId === 'robot-wind-mouth') this.sequenceLength = 2;
    if (gameId === 'breath-lips-hero') this.sequenceLength = 3;
  }

  configure(difficulty: BreathLipCoordinationDifficulty) {
    this.difficulty = difficulty;
    if (this.gameId === 'breath-lips-hero') this.sequenceLength = difficulty === 'easy' ? 2 : 3;
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
    this.lipApproximation = 'OPEN';
    this.lipHint = 'Lips open softly';
    this.airHint = 'Soft air';
    this.smoothedLevel = 0;
    this.levelBuffer = [];
    this.airflowActive = false;
    this.airflowStartMs = null;
    this.lastStopIntensity = 0;
  }

  setCue(lip: LipApproximation, lipHint: string, airHint: string) {
    this.lipApproximation = lip;
    this.lipHint = lipHint;
    this.airHint = airHint;
    this.state = 'SHOWING_PROMPT';
    this.helperVisible = false;
  }

  showPrompt() {
    const idx = this.coordinationAttempt % LIP_SEQUENCE.length;
    const lip = LIP_SEQUENCE[idx] ?? 'OPEN';
    this.setCue(lip, this.defaultLipHint(lip), 'Soft blow or mouth move counts');
  }

  private defaultLipHint(lip: LipApproximation) {
    switch (lip) {
      case 'ROUNDED':
        return 'Round lips gently';
      case 'SPREAD':
        return 'Smile lips softly';
      case 'CLOSED':
        return 'Close lips softly';
      case 'PARTIAL_OPEN':
        return 'Partly open lips';
      default:
        return 'Open lips softly';
    }
  }

  process(rawLevel: number, now = Date.now()): BreathLipCoordinationSnapshot {
    this.lastMs = now;
    if (this.state === 'IDLE') this.state = 'SHOWING_PROMPT';

    const level = clamp01(rawLevel);
    this.levelBuffer.push(level);
    if (this.levelBuffer.length > WINDOW) this.levelBuffer.shift();
    this.smoothedLevel = avg(this.levelBuffer);

    const generous = this.difficulty === 'easy' ? 0.025 : 0.04;
    const active = this.smoothedLevel > this.threshold || level > this.threshold * 0.85 || this.smoothedLevel > this.baseline + generous;

    if (active && !this.airflowActive) {
      this.airflowActive = true;
      this.airflowStartMs = now;
      this.state = 'AIRFLOW_ACTIVE';
    } else if (!active && this.airflowActive) {
      const duration = this.airflowStartMs != null ? now - this.airflowStartMs : 0;
      this.airflowActive = false;
      this.airflowStartMs = null;
      if (duration >= 220) {
        this.recordAttempt(clamp01((this.smoothedLevel - this.baseline) / 0.32), now);
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

    this.engagement = clamp01(this.engagement + Math.max(0, now - this.lastMs) * 0.0001);
    return this.snapshot(now);
  }

  coordinate(now = Date.now()) {
    this.recordAttempt(0.35, now);
  }

  goodTry(now = Date.now()) {
    this.recordAttempt(0.25, now);
    this.triggerReward('SPARKLE');
  }

  private recordAttempt(intensity: number, now: number) {
    this.airflowAttempt += 1;
    this.coordinationAttempt += 1;
    this.lastInteractionMs = now;
    this.lastStopIntensity = intensity;
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

  triggerReward(kind: BreathLipRewardState) {
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

  private snapshot(now: number): BreathLipCoordinationSnapshot {
    return {
      state: this.state,
      airflowAttempt: this.airflowAttempt,
      coordinationAttempt: this.coordinationAttempt,
      lipApproximation: this.lipApproximation,
      engagementLevel: this.engagement,
      rewardState: this.rewardState,
      coordinationPulse: this.coordinationPulse,
      helperVisible: this.helperVisible,
      engagementTimeMs: now - this.startMs,
      airflowActive: this.airflowActive,
      smoothedLevel: this.smoothedLevel,
      lipHint: this.lipHint,
      airHint: this.airHint,
    };
  }

  getAnalytics(gameCompletion = 0): BreathLipCoordinationAnalytics {
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
