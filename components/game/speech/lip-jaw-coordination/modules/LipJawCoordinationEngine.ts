import type {
  LipJawCoordinationAnalytics,
  LipJawCoordinationDifficulty,
  LipJawCoordinationGameId,
  LipJawCoordinationSnapshot,
  LipJawRewardState,
  MouthState,
} from './lipJawCoordinationTypes';

const MOUTH_STATES: MouthState[] = ['OPEN', 'CLOSED', 'ROUNDED', 'SPREAD', 'PARTIAL_OPEN'];

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

/**
 * Lip + jaw coordination — tap / watch-copy only, no STT, no correctness checks.
 */
export class LipJawCoordinationEngine {
  readonly gameId: LipJawCoordinationGameId;
  private difficulty: LipJawCoordinationDifficulty = 'easy';

  private startMs = Date.now();
  private lastMs = this.startMs;
  private lastInteractionMs = this.startMs;

  private coordinationAttempts = 0;
  private imitationAttempts = 0;
  private sequenceStep = 0;
  private sequenceLength = 2;
  private progress = 0;
  private engagement = 0.2;

  private rewardState: LipJawRewardState = 'NONE';
  private coordinationPulse = false;
  private helperVisible = false;
  private helperCount = 0;
  private mouthState: MouthState = 'OPEN';
  private lipHint = 'Lips';
  private jawHint = 'Jaw';
  private state: LipJawCoordinationSnapshot['state'] = 'IDLE';

  constructor(gameId: LipJawCoordinationGameId) {
    this.gameId = gameId;
    if (gameId === 'magic-mouth-switch') this.sequenceLength = 2;
    if (gameId === 'mouth-coordination-hero') this.sequenceLength = 3;
    if (gameId === 'talking-face-rhythm') this.sequenceLength = 2;
  }

  configure(difficulty: LipJawCoordinationDifficulty) {
    this.difficulty = difficulty;
    if (this.gameId === 'mouth-coordination-hero') {
      this.sequenceLength = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 3;
    }
  }

  reset() {
    this.startMs = Date.now();
    this.lastMs = this.startMs;
    this.lastInteractionMs = this.startMs;
    this.coordinationAttempts = 0;
    this.imitationAttempts = 0;
    this.sequenceStep = 0;
    this.progress = 0;
    this.engagement = 0.2;
    this.rewardState = 'NONE';
    this.coordinationPulse = false;
    this.helperVisible = false;
    this.helperCount = 0;
    this.mouthState = 'OPEN';
    this.lipHint = 'Lips';
    this.jawHint = 'Jaw';
    this.state = 'IDLE';
  }

  setCue(mouthState: MouthState, lipHint: string, jawHint: string) {
    this.mouthState = mouthState;
    this.lipHint = lipHint;
    this.jawHint = jawHint;
    this.state = 'SHOWING_PROMPT';
    this.helperVisible = false;
  }

  showPrompt(mouthState?: MouthState) {
    const next = mouthState ?? MOUTH_STATES[this.coordinationAttempts % MOUTH_STATES.length] ?? 'OPEN';
    this.mouthState = next;
    this.lipHint = this.defaultLipHint(next);
    this.jawHint = this.defaultJawHint(next);
    this.state = 'SHOWING_PROMPT';
    this.helperVisible = false;
  }

  private defaultLipHint(state: MouthState) {
    switch (state) {
      case 'CLOSED':
        return 'Lips together';
      case 'ROUNDED':
        return 'Round lips';
      case 'SPREAD':
        return 'Wide smile lips';
      case 'PARTIAL_OPEN':
        return 'Soft lips';
      default:
        return 'Lips wide';
    }
  }

  private defaultJawHint(state: MouthState) {
    switch (state) {
      case 'CLOSED':
        return 'Jaw still';
      case 'ROUNDED':
        return 'Jaw mid';
      case 'SPREAD':
        return 'Jaw open smile';
      case 'PARTIAL_OPEN':
        return 'Jaw a little open';
      default:
        return 'Jaw open';
    }
  }

  /** Any tap or Good try — coordination + imitation attempt */
  coordinate(now = Date.now()) {
    this.coordinationAttempts += 1;
    this.imitationAttempts += 1;
    this.lastInteractionMs = now;
    this.helperVisible = false;
    this.engagement = clamp01(this.engagement + (this.engagement < 0.7 ? 0.07 : 0.035));

    this.state = 'COORDINATION_ACTIVE';
    this.sequenceStep = Math.min(this.sequenceLength, this.sequenceStep + 1);
    this.progress = clamp01(this.sequenceStep / this.sequenceLength);

    const rewardEvery = this.difficulty === 'easy' ? 1 : this.difficulty === 'medium' ? 2 : 3;
    if (this.coordinationAttempts % rewardEvery === 0 || this.sequenceStep >= this.sequenceLength) {
      this.triggerReward(
        this.progress >= 0.95 ? 'HERO' : this.progress >= 0.5 ? 'STAR' : 'SPARKLE',
      );
      if (this.sequenceStep >= this.sequenceLength) {
        this.sequenceStep = 0;
      }
    } else {
      this.state = 'WAITING_FOR_ATTEMPT';
    }

    const idx = (this.coordinationAttempts - 1) % MOUTH_STATES.length;
    this.mouthState = MOUTH_STATES[idx] ?? 'OPEN';
    this.lipHint = this.defaultLipHint(this.mouthState);
    this.jawHint = this.defaultJawHint(this.mouthState);
  }

  triggerReward(kind: LipJawRewardState) {
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

  showHelper() {
    this.helperVisible = true;
    this.helperCount += 1;
    this.state = 'HELPING';
  }

  tick(now = Date.now()): LipJawCoordinationSnapshot {
    const dt = Math.max(0, now - this.lastMs);
    this.lastMs = now;

    if (this.state === 'IDLE') this.state = 'SHOWING_PROMPT';

    if (this.state !== 'PAUSED') {
      this.engagement = clamp01(this.engagement + dt * 0.00012);

      const idleMs = now - this.lastInteractionMs;
      const helperDelay = this.difficulty === 'easy' ? 3500 : this.difficulty === 'medium' ? 4000 : 4500;
      if (idleMs > helperDelay && !this.helperVisible) {
        this.showHelper();
      }

      if (this.helperVisible && idleMs < 900) {
        this.helperVisible = false;
        if (this.state === 'HELPING') this.state = 'WAITING_FOR_ATTEMPT';
      }
    }

    return {
      state: this.state,
      mouthState: this.mouthState,
      coordinationAttempt: this.coordinationAttempts,
      imitationAttempt: this.imitationAttempts,
      sequenceProgress: clamp01(this.sequenceStep / Math.max(1, this.sequenceLength)),
      engagementLevel: this.engagement,
      rewardState: this.rewardState,
      coordinationPulse: this.coordinationPulse,
      helperVisible: this.helperVisible,
      engagementTimeMs: now - this.startMs,
      lipHint: this.lipHint,
      jawHint: this.jawHint,
    };
  }

  getAnalytics(completedGames = 0): LipJawCoordinationAnalytics {
    return {
      engagementTimeMs: Date.now() - this.startMs,
      coordinationAttempts: this.coordinationAttempts,
      imitationAttempts: this.imitationAttempts,
      sequenceProgress: this.progress,
      completedGames,
      helperCount: this.helperCount,
      lastUpdated: Date.now(),
    };
  }
}
