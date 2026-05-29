import type {
  TongueApproximation,
  TongueJawCoordinationAnalytics,
  TongueJawCoordinationDifficulty,
  TongueJawCoordinationGameId,
  TongueJawCoordinationSnapshot,
  TongueJawRewardState,
} from './tongueJawCoordinationTypes';

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

const TONGUE_STATES: TongueApproximation[] = ['TONGUE_OUT_APPROX', 'TONGUE_VISIBLE_APPROX', 'NONE'];

/**
 * Tongue + jaw coordination — tap / watch-copy only.
 * No tongue tracking, no camera validation; prompts are for guidance only.
 */
export class TongueJawCoordinationEngine {
  readonly gameId: TongueJawCoordinationGameId;
  private difficulty: TongueJawCoordinationDifficulty = 'easy';

  private startMs = Date.now();
  private lastMs = this.startMs;
  private lastInteractionMs = this.startMs;

  private coordinationAttempts = 0;
  private imitationAttempts = 0;
  private sequenceStep = 0;
  private sequenceLength = 2;
  private progress = 0;
  private engagement = 0.2;

  private rewardState: TongueJawRewardState = 'NONE';
  private coordinationPulse = false;
  private helperVisible = false;
  private helperCount = 0;

  private tongueApproximation: TongueApproximation = 'NONE';
  private tongueHint = 'Tongue';
  private jawHint = 'Jaw';
  private state: TongueJawCoordinationSnapshot['state'] = 'IDLE';

  constructor(gameId: TongueJawCoordinationGameId) {
    this.gameId = gameId;
    if (gameId === 'magic-mouth-tunnel') this.sequenceLength = 2;
    if (gameId === 'tongue-coordination-hero') this.sequenceLength = 3;
    if (gameId === 'talking-tongue-rhythm') this.sequenceLength = 2;
  }

  configure(difficulty: TongueJawCoordinationDifficulty) {
    this.difficulty = difficulty;
    if (this.gameId === 'tongue-coordination-hero') {
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
    this.tongueApproximation = 'NONE';
    this.tongueHint = 'Tongue';
    this.jawHint = 'Jaw';
    this.state = 'IDLE';
  }

  showPrompt(tongueApproximation?: TongueApproximation) {
    const next =
      tongueApproximation ??
      TONGUE_STATES[this.coordinationAttempts % TONGUE_STATES.length] ??
      'TONGUE_OUT_APPROX';
    this.setCue(next, this.defaultTongueHint(next), this.defaultJawHint(next));
  }

  setCue(tongueApproximation: TongueApproximation, tongueHint: string, jawHint: string) {
    this.tongueApproximation = tongueApproximation;
    this.tongueHint = tongueHint;
    this.jawHint = jawHint;
    this.state = 'SHOWING_PROMPT';
    this.helperVisible = false;
  }

  private defaultTongueHint(state: TongueApproximation) {
    switch (state) {
      case 'TONGUE_OUT_APPROX':
        return 'Tongue out (any try)';
      case 'TONGUE_VISIBLE_APPROX':
        return 'Tongue up/visible (any try)';
      default:
        return 'Tongue in / rest';
    }
  }

  private defaultJawHint(state: TongueApproximation) {
    switch (state) {
      case 'NONE':
        return 'Jaw closed or relaxed';
      default:
        return 'Jaw open';
    }
  }

  /** Any tap or parent Good try counts as coordination + imitation attempt. */
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
      this.triggerReward(this.progress >= 0.95 ? 'HERO' : this.progress >= 0.5 ? 'STAR' : 'SPARKLE');
      if (this.sequenceStep >= this.sequenceLength) this.sequenceStep = 0;
    } else {
      this.state = 'WAITING_FOR_ATTEMPT';
    }

    const idx = (this.coordinationAttempts - 1) % TONGUE_STATES.length;
    const next = TONGUE_STATES[idx] ?? 'TONGUE_OUT_APPROX';
    this.tongueApproximation = next;
    this.tongueHint = this.defaultTongueHint(next);
    this.jawHint = this.defaultJawHint(next);
  }

  triggerReward(kind: TongueJawRewardState) {
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

  tick(now = Date.now()): TongueJawCoordinationSnapshot {
    const dt = Math.max(0, now - this.lastMs);
    this.lastMs = now;

    if (this.state === 'IDLE') this.state = 'SHOWING_PROMPT';

    if (this.state !== 'PAUSED') {
      this.engagement = clamp01(this.engagement + dt * 0.00012);
      const idleMs = now - this.lastInteractionMs;
      const helperDelay =
        this.difficulty === 'easy' ? 3600 : this.difficulty === 'medium' ? 4100 : 4600;
      if (idleMs > helperDelay && !this.helperVisible) this.showHelper();

      if (this.helperVisible && idleMs < 900) {
        this.helperVisible = false;
        if (this.state === 'HELPING') this.state = 'WAITING_FOR_ATTEMPT';
      }
    }

    return {
      state: this.state,
      tongueApproximation: this.tongueApproximation,
      coordinationAttempt: this.coordinationAttempts,
      imitationAttempt: this.imitationAttempts,
      sequenceProgress: clamp01(this.sequenceStep / Math.max(1, this.sequenceLength)),
      engagementLevel: this.engagement,
      rewardState: this.rewardState,
      coordinationPulse: this.coordinationPulse,
      helperVisible: this.helperVisible,
      engagementTimeMs: now - this.startMs,
      tongueHint: this.tongueHint,
      jawHint: this.jawHint,
    };
  }

  getAnalytics(completedGames = 0): TongueJawCoordinationAnalytics {
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

