import type {
  OralApproximation,
  OralSequencingAnalytics,
  OralSequencingDifficulty,
  OralSequencingGameId,
  OralSequencingRewardState,
  OralSequencingSnapshot,
} from './oralSequencingTypes';

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function avg(nums: number[]) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

const WINDOW = 5;

const DEFAULT_STEPS: { key: OralApproximation; label: string }[] = [
  { key: 'OPEN', label: 'Open mouth' },
  { key: 'SPREAD', label: 'Smile lips' },
  { key: 'ROUNDED', label: 'Round lips' },
  { key: 'CLOSED', label: 'Close mouth' },
  { key: 'TONGUE_VISIBLE_APPROX', label: 'Tongue visible' },
];

export class OralSequencingEngine {
  readonly gameId: OralSequencingGameId;
  private difficulty: OralSequencingDifficulty = 'easy';

  private startMs = Date.now();
  private lastMs = this.startMs;
  private lastInteractionMs = this.startMs;

  private state: OralSequencingSnapshot['state'] = 'IDLE';
  private rewardState: OralSequencingRewardState = 'NONE';
  private coordinationPulse = false;
  private helperVisible = false;
  private helperCount = 0;

  private sequenceAttempt = 0;
  private coordinationAttempt = 0;
  private imitationAttempt = 0;
  private stepIndex = 0;
  private sequenceLength = 2;
  private progress = 0;
  private engagement = 0.2;

  private smoothedLevel = 0;
  private levelBuffer: number[] = [];
  private baseline = 0.03;
  private threshold = 0.11;
  private airflowActive = false;

  private currentStep = DEFAULT_STEPS[0];

  constructor(gameId: OralSequencingGameId) {
    this.gameId = gameId;
    if (gameId === 'sequence-hero-adventure') this.sequenceLength = 3;
    if (gameId === 'talking-rhythm-sequence') this.sequenceLength = 2;
  }

  configure(difficulty: OralSequencingDifficulty) {
    this.difficulty = difficulty;
    this.sequenceLength = difficulty === 'easy' ? 2 : 3;
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
    this.sequenceAttempt = 0;
    this.coordinationAttempt = 0;
    this.imitationAttempt = 0;
    this.stepIndex = 0;
    this.progress = 0;
    this.engagement = 0.2;
    this.smoothedLevel = 0;
    this.levelBuffer = [];
    this.airflowActive = false;
    this.currentStep = DEFAULT_STEPS[0];
  }

  showPrompt() {
    this.currentStep = DEFAULT_STEPS[this.stepIndex % DEFAULT_STEPS.length] ?? DEFAULT_STEPS[0];
    this.state = 'SHOWING_PROMPT';
    this.helperVisible = false;
  }

  process(rawLevel: number, now = Date.now()): OralSequencingSnapshot {
    if (this.state === 'IDLE') this.showPrompt();

    const level = clamp01(rawLevel);
    this.levelBuffer.push(level);
    if (this.levelBuffer.length > WINDOW) this.levelBuffer.shift();
    this.smoothedLevel = avg(this.levelBuffer);
    this.airflowActive = this.smoothedLevel > this.threshold || level > this.threshold * 0.85;

    const idleMs = now - this.lastInteractionMs;
    const helperDelay = this.difficulty === 'easy' ? 3800 : this.difficulty === 'medium' ? 4300 : 4800;
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
    this.sequenceAttempt += 1;
    this.coordinationAttempt += 1;
    this.imitationAttempt += 1;
    this.lastInteractionMs = now;
    this.helperVisible = false;
    this.engagement = clamp01(this.engagement + (this.engagement < 0.7 ? 0.07 : 0.035));

    this.state = 'SEQUENCE_ACTIVE';
    this.stepIndex = (this.stepIndex + 1) % DEFAULT_STEPS.length;
    this.currentStep = DEFAULT_STEPS[this.stepIndex] ?? DEFAULT_STEPS[0];

    const stepCount = (this.sequenceAttempt % this.sequenceLength) || this.sequenceLength;
    this.progress = clamp01(stepCount / this.sequenceLength);

    const rewardEvery = this.difficulty === 'easy' ? 1 : this.difficulty === 'medium' ? 2 : 3;
    if (this.sequenceAttempt % rewardEvery === 0 || this.progress >= 0.95) {
      this.triggerReward(this.progress >= 0.95 ? 'HERO' : this.progress >= 0.5 ? 'STAR' : 'SPARKLE');
    } else {
      this.state = 'WAITING_FOR_ATTEMPT';
    }
  }

  goodTry(now = Date.now()) {
    this.coordinate(now);
    this.triggerReward('SPARKLE');
  }

  triggerReward(kind: OralSequencingRewardState) {
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

  private snapshot(now: number): OralSequencingSnapshot {
    return {
      state: this.state,
      sequenceAttempt: this.sequenceAttempt,
      coordinationAttempt: this.coordinationAttempt,
      imitationAttempt: this.imitationAttempt,
      engagementLevel: this.engagement,
      rewardState: this.rewardState,
      coordinationPulse: this.coordinationPulse,
      helperVisible: this.helperVisible,
      engagementTimeMs: now - this.startMs,
      sequenceProgress: this.progress,
      airflowActive: this.airflowActive,
      smoothedLevel: this.smoothedLevel,
      currentStepLabel: this.currentStep.label,
    };
  }

  getAnalytics(gameCompletion = 0): OralSequencingAnalytics {
    return {
      engagementTimeMs: Date.now() - this.startMs,
      sequenceAttempts: this.sequenceAttempt,
      coordinationAttempts: this.coordinationAttempt,
      gameCompletion,
      sequenceProgress: this.progress,
      helperCount: this.helperCount,
      lastUpdated: Date.now(),
    };
  }
}
