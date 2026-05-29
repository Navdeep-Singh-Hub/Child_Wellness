import type {
  PostureClass,
  VowelShape,
  VowelShapingAnalytics,
  VowelShapingDifficulty,
  VowelShapingGameId,
  VowelShapingRewardState,
  VowelShapingSnapshot,
} from './vowelShapingTypes';

const VOWELS: VowelShape[] = ['aaa', 'ooo', 'eee'];

export function vowelToPostureHint(shape: VowelShape): PostureClass | null {
  switch (shape) {
    case 'aaa':
      return 'OPEN';
    case 'ooo':
      return 'ROUNDED';
    case 'eee':
      return 'SPREAD';
    default:
      return null;
  }
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

/**
 * Vowel shaping awareness — no speech recognition, no correctness.
 * Any imitation tap or Good try counts; optional vocal boosts approximation only.
 */
export class VowelShapingEngine {
  readonly gameId: VowelShapingGameId;
  private difficulty: VowelShapingDifficulty = 'easy';

  private startMs = Date.now();
  private lastMs = this.startMs;
  private lastInteractionMs = this.startMs;

  private imitationAttempts = 0;
  private vocalAttempts = 0;
  private progress = 0;
  private engagement = 0.2;
  private sequenceStep = 0;

  private rewardState: VowelShapingRewardState = 'NONE';
  private rewardPulse = false;
  private helperVisible = false;
  private promptShape: VowelShape = 'watch';
  private state: VowelShapingSnapshot['state'] = 'IDLE';
  private helperCount = 0;
  private vowelExposure: string[] = [];
  private lastApproximation = 0.5;

  constructor(gameId: VowelShapingGameId) {
    this.gameId = gameId;
  }

  configure(difficulty: VowelShapingDifficulty) {
    this.difficulty = difficulty;
  }

  reset() {
    this.startMs = Date.now();
    this.lastMs = this.startMs;
    this.lastInteractionMs = this.startMs;
    this.imitationAttempts = 0;
    this.vocalAttempts = 0;
    this.progress = 0;
    this.engagement = 0.2;
    this.sequenceStep = 0;
    this.rewardState = 'NONE';
    this.rewardPulse = false;
    this.helperVisible = false;
    this.promptShape = 'watch';
    this.state = 'IDLE';
    this.helperCount = 0;
    this.vowelExposure = [];
    this.lastApproximation = 0.5;
  }

  setPaused(paused: boolean) {
    this.state = paused ? 'PAUSED' : 'SHOWING_PROMPT';
  }

  showPrompt(shape?: VowelShape) {
    this.promptShape = shape ?? VOWELS[this.sequenceStep % VOWELS.length] ?? 'aaa';
    this.state = 'SHOWING_PROMPT';
    this.helperVisible = false;
  }

  imitate(opts?: { withVocal?: boolean }) {
    const now = Date.now();
    this.imitationAttempts += 1;
    this.lastInteractionMs = now;
    this.helperVisible = false;
    if (opts?.withVocal) this.vocalAttempts += 1;

    const exposure = this.promptShape;
    if (!this.vowelExposure.includes(exposure)) {
      this.vowelExposure = [...this.vowelExposure, exposure];
    }

    this.sequenceStep += 1;
    this.engagement = clamp01(this.engagement + 0.07);
    this.progress = clamp01(this.progress + 0.17);
    this.lastApproximation = clamp01(
      0.55 + (opts?.withVocal ? 0.2 : 0.1) + (this.difficulty === 'easy' ? 0.15 : 0.08),
    );

    this.promptShape = VOWELS[this.imitationAttempts % VOWELS.length] ?? 'aaa';

    const rewardEvery = this.difficulty === 'easy' ? 1 : this.difficulty === 'medium' ? 2 : 3;
    if (this.imitationAttempts % rewardEvery === 0) {
      this.triggerReward(
        this.progress >= 0.88 ? 'HERO' : this.progress >= 0.5 ? 'STAR' : 'SPARKLE',
      );
    }

    this.state = 'WAITING_FOR_IMITATION';
  }

  triggerReward(kind: VowelShapingRewardState) {
    this.rewardState = kind;
    this.rewardPulse = true;
    this.state = 'REWARDING';
  }

  consumeRewardPulse() {
    if (!this.rewardPulse) return false;
    this.rewardPulse = false;
    if (this.state === 'REWARDING') this.state = 'WAITING_FOR_IMITATION';
    return true;
  }

  showHelper() {
    this.helperVisible = true;
    this.helperCount += 1;
    this.state = 'HELPING';
  }

  tick(now = Date.now()): VowelShapingSnapshot {
    const dt = Math.max(0, now - this.lastMs);
    this.lastMs = now;

    if (this.state === 'IDLE') this.state = 'SHOWING_PROMPT';

    if (this.state !== 'PAUSED') {
      this.engagement = clamp01(this.engagement + dt * 0.0001);

      const idleMs = now - this.lastInteractionMs;
      const helperDelay = this.difficulty === 'easy' ? 3600 : this.difficulty === 'medium' ? 4000 : 4400;
      if (idleMs > helperDelay && !this.helperVisible) {
        this.showHelper();
      }

      if (this.helperVisible && idleMs < 900) {
        this.helperVisible = false;
        if (this.state === 'HELPING') this.state = 'WAITING_FOR_IMITATION';
      }
    }

    return {
      state: this.state,
      vowelShapeDetected: this.promptShape,
      approximationLevel: this.lastApproximation,
      vocalAttempt: this.vocalAttempts,
      imitationAttempts: this.imitationAttempts,
      engagementLevel: this.engagement,
      rewardState: this.rewardState,
      rewardPulse: this.rewardPulse,
      postureHint: vowelToPostureHint(this.promptShape),
      helperVisible: this.helperVisible,
      engagementTimeMs: now - this.startMs,
      vowelExposure: [...this.vowelExposure],
    };
  }

  getAnalytics(completedGames = 0): VowelShapingAnalytics {
    return {
      engagementTimeMs: Date.now() - this.startMs,
      imitationAttempts: this.imitationAttempts,
      vocalAttempts: this.vocalAttempts,
      vowelExposure: [...this.vowelExposure],
      completedGames,
      helperCount: this.helperCount,
      lastUpdated: Date.now(),
    };
  }
}
