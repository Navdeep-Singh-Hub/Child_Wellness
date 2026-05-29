import type {
  EarlySyllable,
  EarlySyllableControlAnalytics,
  EarlySyllableControlGameId,
  EarlySyllableControlSnapshot,
  EarlySyllableDifficulty,
  EarlySyllableRewardState,
  MouthPosture,
} from './earlySyllableControlTypes';

const CORE_SYLLABLES: EarlySyllable[] = ['ma', 'pa', 'ba'];
const EXTENDED_SYLLABLES: EarlySyllable[] = ['ma', 'pa', 'ba', 'moo', 'bee', 'aaa'];

export function syllableToLabel(syllable: EarlySyllable): string {
  switch (syllable) {
    case 'ma':
      return 'MA';
    case 'pa':
      return 'PA';
    case 'ba':
      return 'BA';
    case 'moo':
      return 'MOO';
    case 'bee':
      return 'BEE';
    case 'aaa':
      return 'AAA';
    default:
      return 'Watch';
  }
}

export function syllableToPostureHint(syllable: EarlySyllable): MouthPosture | null {
  switch (syllable) {
    case 'ma':
    case 'pa':
    case 'ba':
      return 'CLOSED';
    case 'moo':
      return 'ROUNDED';
    case 'bee':
      return 'SPREAD';
    case 'aaa':
      return 'OPEN';
    default:
      return null;
  }
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

/**
 * Early syllable readiness — no STT, no phoneme scoring.
 * Any tap, mouth movement, hum, or optional vocal counts.
 */
export class EarlySyllableControlEngine {
  readonly gameId: EarlySyllableControlGameId;
  private difficulty: EarlySyllableDifficulty = 'easy';

  private startMs = Date.now();
  private lastMs = this.startMs;
  private lastInteractionMs = this.startMs;

  private syllableAttempts = 0;
  private vocalAttempts = 0;
  private sequenceProgress = 0;
  private engagement = 0.2;

  private rewardState: EarlySyllableRewardState = 'NONE';
  private rewardPulse = false;
  private helperVisible = false;
  private promptSyllable: EarlySyllable = 'watch';
  private state: EarlySyllableControlSnapshot['state'] = 'IDLE';
  private helperCount = 0;
  private syllableExposure: string[] = [];

  constructor(gameId: EarlySyllableControlGameId) {
    this.gameId = gameId;
  }

  configure(difficulty: EarlySyllableDifficulty) {
    this.difficulty = difficulty;
  }

  reset() {
    this.startMs = Date.now();
    this.lastMs = this.startMs;
    this.lastInteractionMs = this.startMs;
    this.syllableAttempts = 0;
    this.vocalAttempts = 0;
    this.sequenceProgress = 0;
    this.engagement = 0.2;
    this.rewardState = 'NONE';
    this.rewardPulse = false;
    this.helperVisible = false;
    this.promptSyllable = 'watch';
    this.state = 'IDLE';
    this.helperCount = 0;
    this.syllableExposure = [];
  }

  setPaused(paused: boolean) {
    this.state = paused ? 'PAUSED' : 'SHOWING_PROMPT';
  }

  private syllablesForDifficulty(): EarlySyllable[] {
    return this.difficulty === 'easy' ? CORE_SYLLABLES : EXTENDED_SYLLABLES;
  }

  showPrompt(syllable?: EarlySyllable) {
    const pool = this.syllablesForDifficulty();
    this.promptSyllable = syllable ?? pool[this.syllableAttempts % pool.length] ?? pool[0] ?? 'ma';
    this.state = 'SHOWING_PROMPT';
    this.helperVisible = false;
  }

  attempt(opts?: { withVocal?: boolean; syllable?: EarlySyllable }) {
    const now = Date.now();
    this.syllableAttempts += 1;
    this.lastInteractionMs = now;
    this.helperVisible = false;
    if (opts?.withVocal) this.vocalAttempts += 1;

    const exposure = opts?.syllable ?? this.promptSyllable;
    if (exposure !== 'watch' && !this.syllableExposure.includes(exposure)) {
      this.syllableExposure = [...this.syllableExposure, exposure];
    }

    const pool = this.syllablesForDifficulty();
    this.sequenceProgress = clamp01(this.sequenceProgress + 1 / Math.max(3, pool.length));
    this.engagement = clamp01(this.engagement + 0.07);

    this.promptSyllable = pool[this.syllableAttempts % pool.length] ?? 'ma';

    const rewardEvery = this.difficulty === 'easy' ? 1 : this.difficulty === 'medium' ? 2 : 3;
    if (this.syllableAttempts % rewardEvery === 0) {
      this.triggerReward(
        this.sequenceProgress >= 0.88 ? 'HERO' : this.sequenceProgress >= 0.5 ? 'STAR' : 'SPARKLE',
      );
    }

    this.state = 'WAITING_FOR_ATTEMPT';
  }

  triggerReward(kind: EarlySyllableRewardState) {
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

  tick(now = Date.now()): EarlySyllableControlSnapshot {
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
      currentSyllable: this.promptSyllable,
      syllableAttempt: this.syllableAttempts,
      vocalAttempt: this.vocalAttempts,
      sequenceProgress: this.sequenceProgress,
      engagementLevel: this.engagement,
      rewardState: this.rewardState,
      rewardPulse: this.rewardPulse,
      postureHint: syllableToPostureHint(this.promptSyllable),
      helperVisible: this.helperVisible,
      engagementTimeMs: now - this.startMs,
      syllableExposure: [...this.syllableExposure],
    };
  }

  getAnalytics(completedGames = 0): EarlySyllableControlAnalytics {
    return {
      engagementTimeMs: Date.now() - this.startMs,
      vocalAttempts: this.vocalAttempts,
      syllableAttempts: this.syllableAttempts,
      sequenceProgress: this.sequenceProgress,
      syllableExposure: [...this.syllableExposure],
      completedGames,
      helperCount: this.helperCount,
      lastUpdated: Date.now(),
    };
  }
}
