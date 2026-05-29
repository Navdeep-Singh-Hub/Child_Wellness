import type {
  FunctionalCoordinationAnalytics,
  FunctionalCoordinationDifficulty,
  FunctionalCoordinationGameId,
  FunctionalCoordinationSnapshot,
  FunctionalRewardState,
  OralApproximation,
} from './functionalCoordinationTypes';

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function avg(nums: number[]) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

const WINDOW = 5;
const STEPS: { key: OralApproximation; label: string }[] = [
  { key: 'OPEN', label: 'Open mouth' },
  { key: 'ROUNDED', label: 'Round lips' },
  { key: 'SPREAD', label: 'Smile lips' },
  { key: 'TONGUE_VISIBLE_APPROX', label: 'Tongue visible' },
  { key: 'CLOSED', label: 'Close mouth' },
];

export class FunctionalCoordinationEngine {
  readonly gameId: FunctionalCoordinationGameId;
  private difficulty: FunctionalCoordinationDifficulty = 'easy';
  private state: FunctionalCoordinationSnapshot['state'] = 'IDLE';
  private rewardState: FunctionalRewardState = 'NONE';
  private coordinationPulse = false;
  private helperVisible = false;
  private helperCount = 0;

  private startMs = Date.now();
  private lastMs = this.startMs;
  private lastInteractionMs = this.startMs;
  private sequenceShownAtMs = this.startMs;

  private coordinationAttempt = 0;
  private planningAttempt = 0;
  private sequenceAttempt = 0;
  private stepIndex = 0;
  private sequenceLength = 2;
  private progress = 0;
  private engagement = 0.2;

  private smoothedLevel = 0;
  private levelBuffer: number[] = [];
  private baseline = 0.03;
  private threshold = 0.11;
  private airflowActive = false;
  private currentStep = STEPS[0];

  constructor(gameId: FunctionalCoordinationGameId) {
    this.gameId = gameId;
    if (gameId === 'coordination-hero-graduation') this.sequenceLength = 3;
  }

  configure(difficulty: FunctionalCoordinationDifficulty) {
    this.difficulty = difficulty;
    this.sequenceLength = difficulty === 'easy' ? 2 : 3;
    const margin = difficulty === 'easy' ? 0.05 : difficulty === 'medium' ? 0.075 : 0.1;
    this.threshold = this.baseline + margin;
  }

  reset() {
    this.state = 'IDLE';
    this.rewardState = 'NONE';
    this.coordinationPulse = false;
    this.helperVisible = false;
    this.helperCount = 0;
    this.startMs = Date.now();
    this.lastMs = this.startMs;
    this.lastInteractionMs = this.startMs;
    this.sequenceShownAtMs = this.startMs;
    this.coordinationAttempt = 0;
    this.planningAttempt = 0;
    this.sequenceAttempt = 0;
    this.stepIndex = 0;
    this.progress = 0;
    this.engagement = 0.2;
    this.smoothedLevel = 0;
    this.levelBuffer = [];
    this.airflowActive = false;
    this.currentStep = STEPS[0];
  }

  showSequence(now = Date.now()) {
    this.currentStep = STEPS[this.stepIndex % STEPS.length] ?? STEPS[0];
    this.state = 'SHOWING_SEQUENCE';
    this.sequenceShownAtMs = now;
    this.helperVisible = false;
  }

  process(rawLevel: number, now = Date.now()): FunctionalCoordinationSnapshot {
    if (this.state === 'IDLE') this.showSequence(now);

    const level = clamp01(rawLevel);
    this.levelBuffer.push(level);
    if (this.levelBuffer.length > WINDOW) this.levelBuffer.shift();
    this.smoothedLevel = avg(this.levelBuffer);
    this.airflowActive = this.smoothedLevel > this.threshold || level > this.threshold * 0.85;

    const showDelay = this.difficulty === 'easy' ? 1000 : this.difficulty === 'medium' ? 850 : 700;
    if (this.state === 'SHOWING_SEQUENCE' && now - this.sequenceShownAtMs >= showDelay) {
      this.state = 'PREPARE_PHASE';
    } else if (this.state === 'PREPARE_PHASE' && now - this.sequenceShownAtMs >= showDelay + 700) {
      this.state = 'WAITING_FOR_ATTEMPT';
    }

    const idleMs = now - this.lastInteractionMs;
    const helperDelay = this.difficulty === 'easy' ? 3800 : this.difficulty === 'medium' ? 4300 : 4800;
    if (idleMs > helperDelay && !this.helperVisible) {
      this.helperVisible = true;
      this.helperCount += 1;
      this.state = 'HELPING';
    }

    const dt = Math.max(0, now - this.lastMs);
    this.lastMs = now;
    this.engagement = clamp01(this.engagement + dt * 0.0001);
    return this.snapshot(now);
  }

  coordinate(now = Date.now()) {
    this.state = 'COORDINATION_ACTIVE';
    this.coordinationAttempt += 1;
    this.planningAttempt += 1;
    this.sequenceAttempt += 1;
    this.lastInteractionMs = now;
    this.helperVisible = false;
    this.engagement = clamp01(this.engagement + (this.engagement < 0.7 ? 0.07 : 0.035));

    this.stepIndex = (this.stepIndex + 1) % STEPS.length;
    this.currentStep = STEPS[this.stepIndex] ?? STEPS[0];

    const count = (this.sequenceAttempt % this.sequenceLength) || this.sequenceLength;
    this.progress = clamp01(count / this.sequenceLength);
    const rewardEvery = this.difficulty === 'easy' ? 1 : this.difficulty === 'medium' ? 2 : 3;
    const reward: FunctionalRewardState =
      this.progress >= 0.95 ? 'HERO' : this.progress >= 0.5 ? 'STAR' : 'SPARKLE';
    if (this.sequenceAttempt % rewardEvery === 0 || this.progress >= 0.95) {
      this.triggerReward(reward);
    } else {
      this.state = 'WAITING_FOR_ATTEMPT';
    }
    this.showSequence(now);
  }

  goodTry(now = Date.now()) {
    this.coordinate(now);
    this.triggerReward('SPARKLE');
  }

  triggerReward(kind: FunctionalRewardState) {
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

  private snapshot(now: number): FunctionalCoordinationSnapshot {
    return {
      state: this.state,
      coordinationAttempt: this.coordinationAttempt,
      planningAttempt: this.planningAttempt,
      sequenceAttempt: this.sequenceAttempt,
      engagementLevel: this.engagement,
      rewardState: this.rewardState,
      coordinationPulse: this.coordinationPulse,
      helperVisible: this.helperVisible,
      engagementTimeMs: now - this.startMs,
      coordinationProgress: this.progress,
      airflowActive: this.airflowActive,
      smoothedLevel: this.smoothedLevel,
      currentStepLabel: this.currentStep.label,
    };
  }

  getAnalytics(gameCompletion = 0): FunctionalCoordinationAnalytics {
    return {
      engagementTimeMs: Date.now() - this.startMs,
      coordinationAttempts: this.coordinationAttempt,
      sequenceAttempts: this.sequenceAttempt,
      gameCompletion,
      coordinationProgress: this.progress,
      helperCount: this.helperCount,
      lastUpdated: Date.now(),
    };
  }
}
