import type {
  TongueAwarenessAnalytics,
  TongueAwarenessDifficulty,
  TongueAwarenessGameId,
  TongueAwarenessRewardState,
  TongueAwarenessSnapshot,
  TongueAwarenessZone,
  TongueExplorationState,
} from './tongueAwarenessTypes';

const ZONES: TongueAwarenessZone[] = ['tongue', 'mouth', 'inside', 'lips', 'roof', 'floor'];
const EXPLORATION: TongueExplorationState[] = ['intro', 'peek', 'mirror', 'play', 'adventure', 'mapping'];

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

/**
 * Tongue awareness only — no tracking, no correctness.
 * Any tap or parent "Good try" counts as participation.
 */
export class TongueAwarenessEngine {
  readonly gameId: TongueAwarenessGameId;
  private difficulty: TongueAwarenessDifficulty = 'easy';

  private startMs = Date.now();
  private lastMs = this.startMs;
  private lastInteractionMs = this.startMs;

  private interactionCount = 0;
  private progress = 0;
  private engagement = 0.2;

  private rewardState: TongueAwarenessRewardState = 'NONE';
  private rewardPulse = false;
  private helperVisible = false;
  private promptZone: TongueAwarenessZone = 'tongue';
  private explorationState: TongueExplorationState = 'intro';
  private state: TongueAwarenessSnapshot['state'] = 'IDLE';

  private helperCount = 0;
  private explorationPatterns: string[] = [];

  constructor(gameId: TongueAwarenessGameId) {
    this.gameId = gameId;
  }

  configure(difficulty: TongueAwarenessDifficulty) {
    this.difficulty = difficulty;
  }

  reset() {
    this.startMs = Date.now();
    this.lastMs = this.startMs;
    this.lastInteractionMs = this.startMs;
    this.interactionCount = 0;
    this.progress = 0;
    this.engagement = 0.2;
    this.rewardState = 'NONE';
    this.rewardPulse = false;
    this.helperVisible = false;
    this.promptZone = 'tongue';
    this.explorationState = 'intro';
    this.state = 'IDLE';
    this.helperCount = 0;
    this.explorationPatterns = [];
  }

  setPaused(paused: boolean) {
    this.state = paused ? 'PAUSED' : 'SHOWING_PROMPT';
  }

  showPrompt(zone?: TongueAwarenessZone, now = Date.now()) {
    this.promptZone = zone ?? ZONES[this.interactionCount % ZONES.length] ?? 'tongue';
    this.explorationState = EXPLORATION[this.interactionCount % EXPLORATION.length] ?? 'intro';
    this.lastInteractionMs = now;
    this.state = 'SHOWING_PROMPT';
    this.helperVisible = false;
  }

  interact(now = Date.now()) {
    this.interactionCount += 1;
    this.lastInteractionMs = now;
    this.helperVisible = false;
    this.engagement = clamp01(this.engagement + (this.engagement < 0.65 ? 0.07 : 0.035));

    this.promptZone = ZONES[this.interactionCount % ZONES.length] ?? 'tongue';
    this.explorationState = EXPLORATION[this.interactionCount % EXPLORATION.length] ?? 'peek';
    const pattern = `${this.promptZone}:${this.explorationState}`;
    if (!this.explorationPatterns.includes(pattern)) {
      this.explorationPatterns.push(pattern);
    }

    this.progress = clamp01(this.progress + 0.17);
    const rewardEvery = this.difficulty === 'easy' ? 1 : this.difficulty === 'medium' ? 2 : 3;
    if (this.interactionCount % rewardEvery === 0) {
      this.triggerReward(
        this.progress >= 0.85 ? 'TREASURE' : this.progress >= 0.45 ? 'GIGGLE' : 'SPARKLE',
      );
    }

    this.state = 'WAITING_FOR_INTERACTION';
  }

  triggerReward(kind: TongueAwarenessRewardState) {
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

  tick(now = Date.now()): TongueAwarenessSnapshot {
    const dt = Math.max(0, now - this.lastMs);
    this.lastMs = now;

    if (this.state === 'IDLE') this.state = 'SHOWING_PROMPT';

    if (this.state !== 'PAUSED') {
      this.engagement = clamp01(this.engagement + dt * 0.00012);

      const idleMs = now - this.lastInteractionMs;
      const helperDelay = this.difficulty === 'easy' ? 3000 : this.difficulty === 'medium' ? 3400 : 3800;
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
      explorationState: this.explorationState,
      rewardState: this.rewardState,
      rewardPulse: this.rewardPulse,
      promptZone: this.promptZone,
      helperVisible: this.helperVisible,
      engagementTimeMs: now - this.startMs,
    };
  }

  getAnalytics(completedGames = 0): TongueAwarenessAnalytics {
    return {
      engagementTimeMs: Date.now() - this.startMs,
      interactionCount: this.interactionCount,
      explorationPatterns: [...this.explorationPatterns],
      completedGames,
      helperCount: this.helperCount,
      lastUpdated: Date.now(),
    };
  }
}
