import type {
  LipApproximation,
  TongueApproximation,
  TongueLipCoordinationAnalytics,
  TongueLipCoordinationDifficulty,
  TongueLipCoordinationGameId,
  TongueLipCoordinationSnapshot,
  TongueLipRewardState,
} from './tongueLipCoordinationTypes';

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

const DEFAULT_LIP_SEQUENCE: LipApproximation[] = [
  'ROUNDED',
  'TONGUE_OUT_APPROX',
  'SPREAD',
  'CLOSED',
  'TONGUE_VISIBLE_APPROX',
  'OPEN',
];

type ApproxInput = {
  lipApproximation: LipApproximation;
  tongueApproximation: TongueApproximation;
};

/**
 * Tongue + lips coordination engine for watch-copy play.
 * No strict correctness checks. Every attempt is rewarded.
 */
export class TongueLipCoordinationEngine {
  readonly gameId: TongueLipCoordinationGameId;
  private difficulty: TongueLipCoordinationDifficulty = 'easy';

  private startMs = Date.now();
  private lastMs = this.startMs;
  private lastInteractionMs = this.startMs;

  private coordinationAttempts = 0;
  private imitationAttempts = 0;
  private sequenceStep = 0;
  private sequenceLength = 2;
  private progress = 0;
  private engagement = 0.2;

  private rewardState: TongueLipRewardState = 'NONE';
  private coordinationPulse = false;
  private helperVisible = false;
  private helperCount = 0;

  private lipApproximation: LipApproximation = 'OPEN';
  private tongueApproximation: TongueApproximation = 'NONE';
  private lipHint = 'Lips open';
  private tongueHint = 'Tongue relaxed';
  private state: TongueLipCoordinationSnapshot['state'] = 'IDLE';

  private smoothWindow: ApproxInput[] = [];
  private smoothWindowSize = 5;

  constructor(gameId: TongueLipCoordinationGameId) {
    this.gameId = gameId;
    if (gameId === 'magic-lip-tongue-switch') this.sequenceLength = 2;
    if (gameId === 'tongue-lips-hero') this.sequenceLength = 3;
  }

  configure(difficulty: TongueLipCoordinationDifficulty) {
    this.difficulty = difficulty;
    if (this.gameId === 'tongue-lips-hero') {
      this.sequenceLength = difficulty === 'easy' ? 2 : 3;
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
    this.lipApproximation = 'OPEN';
    this.tongueApproximation = 'NONE';
    this.lipHint = 'Lips open';
    this.tongueHint = 'Tongue relaxed';
    this.state = 'IDLE';
    this.smoothWindow = [];
  }

  setCue(lipApproximation: LipApproximation, tongueApproximation: TongueApproximation, lipHint: string, tongueHint: string) {
    this.lipApproximation = lipApproximation;
    this.tongueApproximation = tongueApproximation;
    this.lipHint = lipHint;
    this.tongueHint = tongueHint;
    this.state = 'SHOWING_PROMPT';
    this.helperVisible = false;
  }

  showPrompt() {
    const idx = this.coordinationAttempts % DEFAULT_LIP_SEQUENCE.length;
    const lip = DEFAULT_LIP_SEQUENCE[idx] ?? 'OPEN';
    const tongue: TongueApproximation =
      lip === 'TONGUE_OUT_APPROX' ? 'TONGUE_OUT_APPROX' : lip === 'TONGUE_VISIBLE_APPROX' ? 'TONGUE_VISIBLE_APPROX' : 'NONE';
    this.setCue(lip, tongue, this.defaultLipHint(lip), this.defaultTongueHint(tongue));
  }

  ingestApproximation(input: ApproxInput) {
    this.smoothWindow.push(input);
    if (this.smoothWindow.length > this.smoothWindowSize) this.smoothWindow.shift();
    if (!this.smoothWindow.length) return;
    const recent = this.smoothWindow[this.smoothWindow.length - 1];
    if (!recent) return;
    this.lipApproximation = recent.lipApproximation;
    this.tongueApproximation = recent.tongueApproximation;
  }

  private defaultLipHint(lip: LipApproximation) {
    switch (lip) {
      case 'CLOSED':
        return 'Lips closed softly';
      case 'ROUNDED':
        return 'Round lips gently';
      case 'SPREAD':
        return 'Smile lips gently';
      case 'TONGUE_OUT_APPROX':
        return 'Open lips + tongue out try';
      case 'TONGUE_VISIBLE_APPROX':
        return 'Lips open + tongue visible try';
      default:
        return 'Lips open';
    }
  }

  private defaultTongueHint(tongue: TongueApproximation) {
    switch (tongue) {
      case 'TONGUE_OUT_APPROX':
        return 'Tongue out (any try)';
      case 'TONGUE_VISIBLE_APPROX':
        return 'Tongue visible (any try)';
      default:
        return 'Tongue relaxed';
    }
  }

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

    this.showPrompt();
  }

  triggerReward(kind: TongueLipRewardState) {
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

  tick(now = Date.now()): TongueLipCoordinationSnapshot {
    const dt = Math.max(0, now - this.lastMs);
    this.lastMs = now;

    if (this.state === 'IDLE') this.state = 'SHOWING_PROMPT';

    if (this.state !== 'PAUSED') {
      this.engagement = clamp01(this.engagement + dt * 0.00012);
      const idleMs = now - this.lastInteractionMs;
      const helperDelay =
        this.difficulty === 'easy' ? 3600 : this.difficulty === 'medium' ? 4200 : 4600;
      if (idleMs > helperDelay && !this.helperVisible) this.showHelper();

      if (this.helperVisible && idleMs < 900) {
        this.helperVisible = false;
        if (this.state === 'HELPING') this.state = 'WAITING_FOR_ATTEMPT';
      }
    }

    return {
      state: this.state,
      lipApproximation: this.lipApproximation,
      tongueApproximation: this.tongueApproximation,
      coordinationAttempt: this.coordinationAttempts,
      imitationAttempt: this.imitationAttempts,
      sequenceProgress: clamp01(this.sequenceStep / Math.max(1, this.sequenceLength)),
      engagementLevel: this.engagement,
      rewardState: this.rewardState,
      coordinationPulse: this.coordinationPulse,
      helperVisible: this.helperVisible,
      engagementTimeMs: now - this.startMs,
      lipHint: this.lipHint,
      tongueHint: this.tongueHint,
    };
  }

  getAnalytics(completedGames = 0): TongueLipCoordinationAnalytics {
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
