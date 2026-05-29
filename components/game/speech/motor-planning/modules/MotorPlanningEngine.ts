import type {
  MotorPlanningAnalytics,
  MotorPlanningDifficulty,
  MotorPlanningGameId,
  MotorPlanningRewardState,
  MotorPlanningSnapshot,
  OralApproximation,
} from './motorPlanningTypes';

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

export class MotorPlanningEngine {
  readonly gameId: MotorPlanningGameId;
  private difficulty: MotorPlanningDifficulty = 'easy';

  private startMs = Date.now();
  private lastMs = this.startMs;
  private lastInteractionMs = this.startMs;

  private state: MotorPlanningSnapshot['state'] = 'IDLE';
  private rewardState: MotorPlanningRewardState = 'NONE';
  private coordinationPulse = false;
  private helperVisible = false;
  private helperCount = 0;

  private planningAttempt = 0;
  private sequenceAttempt = 0;
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
  private currentStep = STEPS[0];
  private sequenceShownAtMs = this.startMs;

  constructor(gameId: MotorPlanningGameId) {
    this.gameId = gameId;
    if (gameId === 'motor-planning-hero') this.sequenceLength = 3;
  }

  configure(difficulty: MotorPlanningDifficulty) {
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
    this.planningAttempt = 0;
    this.sequenceAttempt = 0;
    this.imitationAttempt = 0;
    this.stepIndex = 0;
    this.progress = 0;
    this.engagement = 0.2;
    this.smoothedLevel = 0;
    this.levelBuffer = [];
    this.airflowActive = false;
    this.currentStep = STEPS[0];
    this.sequenceShownAtMs = this.startMs;
  }

  showSequence(now = Date.now()) {
    this.currentStep = STEPS[this.stepIndex % STEPS.length] ?? STEPS[0];
    this.state = 'SHOWING_SEQUENCE';
    this.sequenceShownAtMs = now;
    this.helperVisible = false;
  }

  process(rawLevel: number, now = Date.now()): MotorPlanningSnapshot {
    if (this.state === 'IDLE') this.showSequence(now);

    const level = clamp01(rawLevel);
    this.levelBuffer.push(level);
    if (this.levelBuffer.length > WINDOW) this.levelBuffer.shift();
    this.smoothedLevel = avg(this.levelBuffer);
    this.airflowActive = this.smoothedLevel > this.threshold || level > this.threshold * 0.85;

    const prepareDelay = this.difficulty === 'easy' ? 900 : this.difficulty === 'medium' ? 750 : 650;
    if (this.state === 'SHOWING_SEQUENCE' && now - this.sequenceShownAtMs >= prepareDelay) {
      this.state = 'PREPARE_PHASE';
    } else if (this.state === 'PREPARE_PHASE' && now - this.sequenceShownAtMs >= prepareDelay + 600) {
      this.state = 'WAITING_FOR_ATTEMPT';
    }

    const idleMs = now - this.lastInteractionMs;
    const helperDelay = this.difficulty === 'easy' ? 4000 : this.difficulty === 'medium' ? 4500 : 5000;
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
    this.planningAttempt += 1;
    this.sequenceAttempt += 1;
    this.imitationAttempt += 1;
    this.lastInteractionMs = now;
    this.helperVisible = false;
    this.engagement = clamp01(this.engagement + (this.engagement < 0.7 ? 0.07 : 0.035));

    this.stepIndex = (this.stepIndex + 1) % STEPS.length;
    this.currentStep = STEPS[this.stepIndex] ?? STEPS[0];

    const count = (this.sequenceAttempt % this.sequenceLength) || this.sequenceLength;
    this.progress = clamp01(count / this.sequenceLength);
    const rewardEvery = this.difficulty === 'easy' ? 1 : this.difficulty === 'medium' ? 2 : 3;
    if (this.sequenceAttempt % rewardEvery === 0 || this.progress >= 0.95) {
      this.triggerReward(this.progress >= 0.95 ? 'HERO' : this.progress >= 0.5 ? 'STAR' : 'SPARKLE');
    } else {
      this.state = 'WAITING_FOR_ATTEMPT';
    }
    this.showSequence(now);
  }

  goodTry(now = Date.now()) {
    this.coordinate(now);
    this.triggerReward('SPARKLE');
  }

  triggerReward(kind: MotorPlanningRewardState) {
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

  private snapshot(now: number): MotorPlanningSnapshot {
    return {
      state: this.state,
      planningAttempt: this.planningAttempt,
      sequenceAttempt: this.sequenceAttempt,
      imitationAttempt: this.imitationAttempt,
      engagementLevel: this.engagement,
      rewardState: this.rewardState,
      coordinationPulse: this.coordinationPulse,
      helperVisible: this.helperVisible,
      engagementTimeMs: now - this.startMs,
      planningProgress: this.progress,
      airflowActive: this.airflowActive,
      smoothedLevel: this.smoothedLevel,
      currentStepLabel: this.currentStep.label,
    };
  }

  getAnalytics(gameCompletion = 0): MotorPlanningAnalytics {
    return {
      engagementTimeMs: Date.now() - this.startMs,
      planningAttempts: this.planningAttempt,
      sequenceAttempts: this.sequenceAttempt,
      gameCompletion,
      planningProgress: this.progress,
      helperCount: this.helperCount,
      lastUpdated: Date.now(),
    };
  }
}
