import type {
  CVPattern,
  CVPreparationAnalytics,
  CVPreparationDifficulty,
  CVPreparationGameId,
  CVPreparationRewardState,
  CVPreparationSnapshot,
  MouthPosture,
} from './cvPreparationTypes';

const CORE_PATTERNS: CVPattern[] = ['ma', 'pa', 'ba'];
const EXTENDED_PATTERNS: CVPattern[] = ['ma', 'pa', 'ba', 'moo', 'bee'];

export function patternToPostureHint(pattern: CVPattern): MouthPosture | null {
  switch (pattern) {
    case 'ma':
    case 'pa':
    case 'ba':
      return 'CLOSED';
    case 'moo':
      return 'ROUNDED';
    case 'bee':
      return 'SPREAD';
    default:
      return null;
  }
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

/**
 * CV speech-pattern readiness — no STT, no phoneme scoring.
 * Any tap, mouth-only imitation, or optional vocal attempt counts.
 */
export class CVPreparationEngine {
  readonly gameId: CVPreparationGameId;
  private difficulty: CVPreparationDifficulty = 'easy';

  private startMs = Date.now();
  private lastMs = this.startMs;
  private lastInteractionMs = this.startMs;

  private imitationAttempts = 0;
  private vocalAttempts = 0;
  private sequenceProgress = 0;
  private engagement = 0.2;

  private rewardState: CVPreparationRewardState = 'NONE';
  private rewardPulse = false;
  private helperVisible = false;
  private promptPattern: CVPattern = 'watch';
  private state: CVPreparationSnapshot['state'] = 'IDLE';
  private helperCount = 0;
  private patternExposure: string[] = [];
  private lastApproximation = 0.5;

  constructor(gameId: CVPreparationGameId) {
    this.gameId = gameId;
  }

  configure(difficulty: CVPreparationDifficulty) {
    this.difficulty = difficulty;
  }

  reset() {
    this.startMs = Date.now();
    this.lastMs = this.startMs;
    this.lastInteractionMs = this.startMs;
    this.imitationAttempts = 0;
    this.vocalAttempts = 0;
    this.sequenceProgress = 0;
    this.engagement = 0.2;
    this.rewardState = 'NONE';
    this.rewardPulse = false;
    this.helperVisible = false;
    this.promptPattern = 'watch';
    this.state = 'IDLE';
    this.helperCount = 0;
    this.patternExposure = [];
    this.lastApproximation = 0.5;
  }

  setPaused(paused: boolean) {
    this.state = paused ? 'PAUSED' : 'SHOWING_PROMPT';
  }

  private patternsForDifficulty(): CVPattern[] {
    return this.difficulty === 'easy' ? CORE_PATTERNS : EXTENDED_PATTERNS;
  }

  showPrompt(pattern?: CVPattern) {
    const pool = this.patternsForDifficulty();
    this.promptPattern =
      pattern ?? pool[this.imitationAttempts % pool.length] ?? pool[0] ?? 'ma';
    this.state = 'SHOWING_PROMPT';
    this.helperVisible = false;
  }

  attempt(opts?: { withVocal?: boolean; pattern?: CVPattern }) {
    const now = Date.now();
    this.imitationAttempts += 1;
    this.lastInteractionMs = now;
    this.helperVisible = false;
    if (opts?.withVocal) this.vocalAttempts += 1;

    const exposure = opts?.pattern ?? this.promptPattern;
    if (exposure !== 'watch' && !this.patternExposure.includes(exposure)) {
      this.patternExposure = [...this.patternExposure, exposure];
    }

    const pool = this.patternsForDifficulty();
    this.sequenceProgress = clamp01(this.sequenceProgress + 1 / Math.max(3, pool.length));
    this.engagement = clamp01(this.engagement + 0.07);
    this.lastApproximation = clamp01(
      0.55 + (opts?.withVocal ? 0.22 : 0.12) + (this.difficulty === 'easy' ? 0.12 : 0.06),
    );

    this.promptPattern = pool[this.imitationAttempts % pool.length] ?? 'ma';

    const rewardEvery = this.difficulty === 'easy' ? 1 : this.difficulty === 'medium' ? 2 : 3;
    if (this.imitationAttempts % rewardEvery === 0) {
      this.triggerReward(
        this.sequenceProgress >= 0.88 ? 'HERO' : this.sequenceProgress >= 0.5 ? 'STAR' : 'SPARKLE',
      );
    }

    this.state = 'WAITING_FOR_ATTEMPT';
  }

  triggerReward(kind: CVPreparationRewardState) {
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

  tick(now = Date.now()): CVPreparationSnapshot {
    const dt = Math.max(0, now - this.lastMs);
    this.lastMs = now;

    if (this.state === 'IDLE') this.state = 'SHOWING_PROMPT';

    if (this.state !== 'PAUSED') {
      this.engagement = clamp01(this.engagement + dt * 0.0001);

      const idleMs = now - this.lastInteractionMs;
      const helperDelay =
        this.difficulty === 'easy' ? 3800 : this.difficulty === 'medium' ? 4200 : 4600;
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
      currentPattern: this.promptPattern,
      mouthApproximation: this.lastApproximation,
      vocalAttempt: this.vocalAttempts,
      imitationAttempts: this.imitationAttempts,
      sequenceProgress: this.sequenceProgress,
      engagementLevel: this.engagement,
      rewardState: this.rewardState,
      rewardPulse: this.rewardPulse,
      postureHint: patternToPostureHint(this.promptPattern),
      helperVisible: this.helperVisible,
      engagementTimeMs: now - this.startMs,
      patternExposure: [...this.patternExposure],
    };
  }

  getAnalytics(completedGames = 0): CVPreparationAnalytics {
    return {
      engagementTimeMs: Date.now() - this.startMs,
      vocalAttempts: this.vocalAttempts,
      imitationAttempts: this.imitationAttempts,
      sequenceProgress: this.sequenceProgress,
      patternExposure: [...this.patternExposure],
      completedGames,
      helperCount: this.helperCount,
      lastUpdated: Date.now(),
    };
  }
}
