import type {
  BilabialRepeat,
  BilabialSequencingAnalytics,
  BilabialSequencingDifficulty,
  BilabialSequencingGameId,
  BilabialSequencingRewardState,
  BilabialSequencingSnapshot,
  MouthPosture,
} from './bilabialSequencingTypes';

const CORE_REPEATS: BilabialRepeat[] = ['ma_ma', 'pa_pa', 'ba_ba'];
const EXTENDED_REPEATS: BilabialRepeat[] = ['ma_ma', 'pa_pa', 'ba_ba', 'mmm'];

export function repeatToPostureHint(repeat: BilabialRepeat): MouthPosture | null {
  switch (repeat) {
    case 'ma_ma':
    case 'pa_pa':
    case 'ba_ba':
      return 'CLOSED';
    case 'mmm':
      return 'CLOSED';
    default:
      return null;
  }
}

export function repeatToLabel(repeat: BilabialRepeat): string {
  switch (repeat) {
    case 'ma_ma':
      return 'MA MA';
    case 'pa_pa':
      return 'PA PA';
    case 'ba_ba':
      return 'BA BA';
    case 'mmm':
      return 'MMM';
    default:
      return 'Watch';
  }
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

/**
 * Bilabial repetition sequencing — no STT, no phoneme scoring.
 * Any tap, mouth movement, hum, or optional vocal counts.
 */
export class BilabialSequencingEngine {
  readonly gameId: BilabialSequencingGameId;
  private difficulty: BilabialSequencingDifficulty = 'easy';

  private startMs = Date.now();
  private lastMs = this.startMs;
  private lastInteractionMs = this.startMs;

  private repetitionAttempts = 0;
  private vocalAttempts = 0;
  private sequenceProgress = 0;
  private engagement = 0.2;
  private chainStep = 0;

  private rewardState: BilabialSequencingRewardState = 'NONE';
  private rewardPulse = false;
  private helperVisible = false;
  private promptRepeat: BilabialRepeat = 'watch';
  private state: BilabialSequencingSnapshot['state'] = 'IDLE';
  private helperCount = 0;
  private repeatExposure: string[] = [];
  private lastApproximation = 0.5;

  constructor(gameId: BilabialSequencingGameId) {
    this.gameId = gameId;
  }

  configure(difficulty: BilabialSequencingDifficulty) {
    this.difficulty = difficulty;
  }

  reset() {
    this.startMs = Date.now();
    this.lastMs = this.startMs;
    this.lastInteractionMs = this.startMs;
    this.repetitionAttempts = 0;
    this.vocalAttempts = 0;
    this.sequenceProgress = 0;
    this.engagement = 0.2;
    this.chainStep = 0;
    this.rewardState = 'NONE';
    this.rewardPulse = false;
    this.helperVisible = false;
    this.promptRepeat = 'watch';
    this.state = 'IDLE';
    this.helperCount = 0;
    this.repeatExposure = [];
    this.lastApproximation = 0.5;
  }

  setPaused(paused: boolean) {
    this.state = paused ? 'PAUSED' : 'SHOWING_PROMPT';
  }

  private repeatsForDifficulty(): BilabialRepeat[] {
    return this.difficulty === 'easy' ? CORE_REPEATS : EXTENDED_REPEATS;
  }

  private chainLength(): number {
    return this.difficulty === 'easy' ? 2 : this.difficulty === 'medium' ? 3 : 4;
  }

  showPrompt(repeat?: BilabialRepeat) {
    const pool = this.repeatsForDifficulty();
    this.promptRepeat = repeat ?? pool[this.repetitionAttempts % pool.length] ?? pool[0] ?? 'ma_ma';
    this.state = 'SHOWING_PROMPT';
    this.helperVisible = false;
  }

  attempt(opts?: { withVocal?: boolean; repeat?: BilabialRepeat }) {
    const now = Date.now();
    this.repetitionAttempts += 1;
    this.lastInteractionMs = now;
    this.helperVisible = false;
    if (opts?.withVocal) this.vocalAttempts += 1;

    const exposure = opts?.repeat ?? this.promptRepeat;
    if (exposure !== 'watch' && !this.repeatExposure.includes(exposure)) {
      this.repeatExposure = [...this.repeatExposure, exposure];
    }

    this.chainStep += 1;
    const chainLen = this.chainLength();
    if (this.chainStep >= chainLen) {
      this.chainStep = 0;
      this.sequenceProgress = clamp01(this.sequenceProgress + 1 / Math.max(3, poolLength(this.difficulty)));
    }

    this.engagement = clamp01(this.engagement + 0.07);
    this.lastApproximation = clamp01(
      0.55 + (opts?.withVocal ? 0.22 : 0.12) + (this.difficulty === 'easy' ? 0.12 : 0.06),
    );

    const pool = this.repeatsForDifficulty();
    this.promptRepeat = pool[this.repetitionAttempts % pool.length] ?? 'ma_ma';

    const rewardEvery = this.difficulty === 'easy' ? 1 : this.difficulty === 'medium' ? 2 : 3;
    if (this.repetitionAttempts % rewardEvery === 0) {
      this.triggerReward(
        this.sequenceProgress >= 0.88 ? 'HERO' : this.sequenceProgress >= 0.5 ? 'STAR' : 'SPARKLE',
      );
    }

    this.state = 'WAITING_FOR_ATTEMPT';
  }

  triggerReward(kind: BilabialSequencingRewardState) {
    this.rewardState = kind;
    this.rewardPulse = true;
    this.state = 'REWARDING';
  }

  consumeRewardPulse() {
    if (!this.rewardPulse) return false;
    this.rewardPulse = false;
    if (this.state === 'REWARDING') this.state = 'WAITING_FOR_ATTEMPT';
    return true;
  }

  showHelper() {
    this.helperVisible = true;
    this.helperCount += 1;
    this.state = 'HELPING';
  }

  tick(now = Date.now()): BilabialSequencingSnapshot {
    const dt = Math.max(0, now - this.lastMs);
    this.lastMs = now;

    if (this.state === 'IDLE') this.state = 'SHOWING_PROMPT';

    if (this.state !== 'PAUSED') {
      this.engagement = clamp01(this.engagement + dt * 0.0001);

      const idleMs = now - this.lastInteractionMs;
      const helperDelay =
        this.difficulty === 'easy' ? 4000 : this.difficulty === 'medium' ? 4400 : 4800;
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
      currentRepeat: this.promptRepeat,
      mouthApproximation: this.lastApproximation,
      vocalAttempt: this.vocalAttempts,
      repetitionAttempt: this.repetitionAttempts,
      sequenceProgress: this.sequenceProgress,
      engagementLevel: this.engagement,
      rewardState: this.rewardState,
      rewardPulse: this.rewardPulse,
      postureHint: repeatToPostureHint(this.promptRepeat),
      helperVisible: this.helperVisible,
      engagementTimeMs: now - this.startMs,
      repeatExposure: [...this.repeatExposure],
    };
  }

  getAnalytics(completedGames = 0): BilabialSequencingAnalytics {
    return {
      engagementTimeMs: Date.now() - this.startMs,
      vocalAttempts: this.vocalAttempts,
      repetitionAttempts: this.repetitionAttempts,
      sequenceProgress: this.sequenceProgress,
      repeatExposure: [...this.repeatExposure],
      completedGames,
      helperCount: this.helperCount,
      lastUpdated: Date.now(),
    };
  }
}

function poolLength(difficulty: BilabialSequencingDifficulty) {
  return difficulty === 'easy' ? 3 : 4;
}
