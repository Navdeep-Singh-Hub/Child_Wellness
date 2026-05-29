import type {
  OralImitationAnalytics,
  OralImitationDifficulty,
  OralImitationGameId,
  OralImitationPrompt,
  OralImitationRewardState,
  OralImitationSnapshot,
} from './oralImitationTypes';

const PROMPTS: OralImitationPrompt[] = [
  'open',
  'close',
  'smile',
  'funny-lips',
  'tongue-out',
  'watch',
  'blow',
  'tap',
];

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

/**
 * Integration session — combines prior oral awareness play.
 * No camera, no speech recognition, no correctness checks.
 */
export class OralImitationIntegrationEngine {
  readonly gameId: OralImitationGameId;
  private difficulty: OralImitationDifficulty = 'easy';

  private startMs = Date.now();
  private lastMs = this.startMs;
  private lastInteractionMs = this.startMs;

  private interactionCount = 0;
  private imitationAttempts = 0;
  private progress = 0;
  private engagement = 0.2;

  private rewardState: OralImitationRewardState = 'NONE';
  private rewardPulse = false;
  private helperVisible = false;
  private prompt: OralImitationPrompt = 'watch';
  private state: OralImitationSnapshot['state'] = 'IDLE';
  private helperCount = 0;

  constructor(gameId: OralImitationGameId) {
    this.gameId = gameId;
  }

  configure(difficulty: OralImitationDifficulty) {
    this.difficulty = difficulty;
  }

  reset() {
    this.startMs = Date.now();
    this.lastMs = this.startMs;
    this.lastInteractionMs = this.startMs;
    this.interactionCount = 0;
    this.imitationAttempts = 0;
    this.progress = 0;
    this.engagement = 0.2;
    this.rewardState = 'NONE';
    this.rewardPulse = false;
    this.helperVisible = false;
    this.prompt = 'watch';
    this.state = 'IDLE';
    this.helperCount = 0;
  }

  setPaused(paused: boolean) {
    this.state = paused ? 'PAUSED' : 'SHOWING_PROMPT';
  }

  showPrompt(prompt?: OralImitationPrompt) {
    this.prompt = prompt ?? PROMPTS[this.imitationAttempts % PROMPTS.length] ?? 'watch';
    this.state = 'SHOWING_PROMPT';
    this.helperVisible = false;
  }

  /** Any tap or parent Good try counts as imitation attempt */
  interact(now = Date.now()) {
    this.interactionCount += 1;
    this.imitationAttempts += 1;
    this.lastInteractionMs = now;
    this.helperVisible = false;
    this.engagement = clamp01(this.engagement + (this.engagement < 0.7 ? 0.07 : 0.035));

    this.prompt = PROMPTS[this.imitationAttempts % PROMPTS.length] ?? 'smile';
    this.progress = clamp01(this.progress + 0.17);

    const rewardEvery = this.difficulty === 'easy' ? 1 : this.difficulty === 'medium' ? 2 : 3;
    if (this.interactionCount % rewardEvery === 0) {
      this.triggerReward(
        this.progress >= 0.88 ? 'HERO' : this.progress >= 0.5 ? 'STAR' : 'SPARKLE',
      );
    }

    this.state = 'WAITING_FOR_INTERACTION';
  }

  triggerReward(kind: OralImitationRewardState) {
    this.rewardState = kind;
    this.rewardPulse = true;
    this.state = 'REWARDING';
  }

  consumeRewardPulse() {
    if (!this.rewardPulse) return false;
    this.rewardPulse = false;
    if (this.state === 'REWARDING') this.state = 'WAITING_FOR_INTERACTION';
    return true;
  }

  showHelper() {
    this.helperVisible = true;
    this.helperCount += 1;
    this.state = 'HELPING';
  }

  tick(now = Date.now()): OralImitationSnapshot {
    const dt = Math.max(0, now - this.lastMs);
    this.lastMs = now;

    if (this.state === 'IDLE') this.state = 'SHOWING_PROMPT';

    if (this.state !== 'PAUSED') {
      this.engagement = clamp01(this.engagement + dt * 0.00012);

      const idleMs = now - this.lastInteractionMs;
      const helperDelay = this.difficulty === 'easy' ? 3200 : this.difficulty === 'medium' ? 3600 : 4000;
      if (idleMs > helperDelay && !this.helperVisible) {
        this.showHelper();
      }

      if (this.helperVisible && idleMs < 900) {
        this.helperVisible = false;
        if (this.state === 'HELPING') this.state = 'WAITING_FOR_INTERACTION';
      }
    }

    return {
      state: this.state,
      gameProgress: this.progress,
      interactionCount: this.interactionCount,
      engagementLevel: this.engagement,
      imitationAttempts: this.imitationAttempts,
      rewardState: this.rewardState,
      rewardPulse: this.rewardPulse,
      prompt: this.prompt,
      helperVisible: this.helperVisible,
      engagementTimeMs: now - this.startMs,
    };
  }

  getAnalytics(completedGames = 0): OralImitationAnalytics {
    return {
      engagementTimeMs: Date.now() - this.startMs,
      interactionCount: this.interactionCount,
      imitationAttempts: this.imitationAttempts,
      completedGames,
      helperCount: this.helperCount,
      lastUpdated: Date.now(),
    };
  }
}
