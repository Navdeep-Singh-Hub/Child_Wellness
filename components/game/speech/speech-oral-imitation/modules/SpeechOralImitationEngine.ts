import type {
  ApproximatePosture,
  SpeechOralImitationAnalytics,
  SpeechOralImitationDifficulty,
  SpeechOralImitationGameId,
  SpeechOralImitationRewardState,
  SpeechMouthShape,
  SpeechOralImitationSnapshot,
} from './speechOralImitationTypes';

const SHAPES: SpeechMouthShape[] = ['open', 'closed', 'round', 'smile', 'ooo', 'eee', 'spread'];

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

/** Maps target shape → optional posture hint (encouragement only, never validates) */
export function shapeToPostureHint(shape: SpeechMouthShape): ApproximatePosture | null {
  switch (shape) {
    case 'open':
      return 'OPEN';
    case 'closed':
      return 'CLOSED';
    case 'round':
    case 'ooo':
      return 'ROUNDED';
    case 'spread':
    case 'eee':
    case 'smile':
      return 'SPREAD';
    default:
      return null;
  }
}

/**
 * Speech motor imitation — effort-based only.
 * No speech recognition, no correctness punishment.
 */
export class SpeechOralImitationEngine {
  readonly gameId: SpeechOralImitationGameId;
  private difficulty: SpeechOralImitationDifficulty = 'easy';

  private startMs = Date.now();
  private lastMs = this.startMs;
  private lastInteractionMs = this.startMs;

  private interactionCount = 0;
  private imitationAttempts = 0;
  private progress = 0;
  private engagement = 0.2;
  private sequenceStep = 0;
  private sequenceLength = 2;

  private rewardState: SpeechOralImitationRewardState = 'NONE';
  private rewardPulse = false;
  private helperVisible = false;
  private promptShape: SpeechMouthShape = 'watch';
  private state: SpeechOralImitationSnapshot['state'] = 'IDLE';
  private helperCount = 0;
  private encouragementPosture: ApproximatePosture | null = null;

  constructor(gameId: SpeechOralImitationGameId) {
    this.gameId = gameId;
    if (gameId === 'mouth-pattern-match') this.sequenceLength = 2;
    if (gameId === 'speech-hero-warmup') this.sequenceLength = 4;
  }

  configure(difficulty: SpeechOralImitationDifficulty) {
    this.difficulty = difficulty;
    this.sequenceLength =
      this.gameId === 'mouth-pattern-match'
        ? difficulty === 'easy'
          ? 2
          : difficulty === 'medium'
            ? 2
            : 3
        : this.gameId === 'speech-hero-warmup'
          ? difficulty === 'easy'
            ? 3
            : 4
          : 2;
  }

  reset() {
    this.startMs = Date.now();
    this.lastMs = this.startMs;
    this.lastInteractionMs = this.startMs;
    this.interactionCount = 0;
    this.imitationAttempts = 0;
    this.progress = 0;
    this.engagement = 0.2;
    this.sequenceStep = 0;
    this.rewardState = 'NONE';
    this.rewardPulse = false;
    this.helperVisible = false;
    this.promptShape = 'watch';
    this.state = 'IDLE';
    this.helperCount = 0;
    this.encouragementPosture = null;
  }

  setPaused(paused: boolean) {
    this.state = paused ? 'PAUSED' : 'SHOWING_PROMPT';
  }

  showPrompt(shape?: SpeechMouthShape) {
    this.promptShape = shape ?? SHAPES[this.sequenceStep % SHAPES.length] ?? 'open';
    this.encouragementPosture = shapeToPostureHint(this.promptShape);
    this.state = 'SHOWING_PROMPT';
    this.helperVisible = false;
  }

  setEncouragementPosture(posture: ApproximatePosture | null) {
    this.encouragementPosture = posture;
  }

  imitate(now = Date.now()) {
    this.interactionCount += 1;
    this.imitationAttempts += 1;
    this.lastInteractionMs = now;
    this.helperVisible = false;
    this.engagement = clamp01(this.engagement + (this.engagement < 0.7 ? 0.07 : 0.035));

    this.sequenceStep = Math.min(this.sequenceLength, this.sequenceStep + 1);
    this.progress = clamp01(this.sequenceStep / this.sequenceLength);

    this.promptShape = SHAPES[this.imitationAttempts % SHAPES.length] ?? 'open';
    this.encouragementPosture = shapeToPostureHint(this.promptShape);

    const rewardEvery = this.difficulty === 'easy' ? 1 : this.difficulty === 'medium' ? 2 : 3;
    if (this.interactionCount % rewardEvery === 0 || this.sequenceStep >= this.sequenceLength) {
      this.triggerReward(
        this.progress >= 0.95 ? 'HERO' : this.progress >= 0.5 ? 'STAR' : 'SPARKLE',
      );
      if (this.sequenceStep >= this.sequenceLength) {
        this.sequenceStep = 0;
      }
    }

    this.state = 'WAITING_FOR_IMITATION';
  }

  triggerReward(kind: SpeechOralImitationRewardState) {
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

  tick(now = Date.now()): SpeechOralImitationSnapshot {
    const dt = Math.max(0, now - this.lastMs);
    this.lastMs = now;

    if (this.state === 'IDLE') this.state = 'SHOWING_PROMPT';

    if (this.state !== 'PAUSED') {
      this.engagement = clamp01(this.engagement + dt * 0.00012);

      const idleMs = now - this.lastInteractionMs;
      const helperDelay = this.difficulty === 'easy' ? 3400 : this.difficulty === 'medium' ? 3800 : 4200;
      if (idleMs > helperDelay && !this.helperVisible) {
        this.showHelper();
      }

      if (this.helperVisible && idleMs < 900) {
        this.helperVisible = false;
        if (this.state === 'HELPING') this.state = 'WAITING_FOR_IMITATION';
      }
    }

    const sequenceProgress =
      this.sequenceLength > 0 ? clamp01(this.sequenceStep / this.sequenceLength) : this.progress;

    return {
      state: this.state,
      gameProgress: this.progress,
      interactionCount: this.interactionCount,
      imitationAttempts: this.imitationAttempts,
      engagementLevel: this.engagement,
      sequenceProgress,
      sequenceStep: this.sequenceStep,
      rewardState: this.rewardState,
      rewardPulse: this.rewardPulse,
      promptShape: this.promptShape,
      helperVisible: this.helperVisible,
      engagementTimeMs: now - this.startMs,
      encouragementPosture: this.encouragementPosture,
    };
  }

  getAnalytics(completedGames = 0): SpeechOralImitationAnalytics {
    return {
      engagementTimeMs: Date.now() - this.startMs,
      interactionCount: this.interactionCount,
      imitationAttempts: this.imitationAttempts,
      sequenceProgress: this.progress,
      completedGames,
      helperCount: this.helperCount,
      lastUpdated: Date.now(),
    };
  }
}
