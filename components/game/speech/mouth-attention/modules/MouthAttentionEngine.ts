import type {
  MouthAttentionAnalytics,
  MouthAttentionDifficulty,
  MouthAttentionGameId,
  MouthAttentionRewardState,
  MouthAttentionSnapshot,
  MouthAttentionTarget,
} from './mouthAttentionTypes';

const TARGETS: MouthAttentionTarget[] = ['lips', 'mouth', 'tongue', 'jaw', 'cheek'];

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

/**
 * Attention-only engine (no correctness pressure).
 * Any interaction increments engagement; helpers appear gently on inactivity.
 */
export class MouthAttentionEngine {
  readonly gameId: MouthAttentionGameId;
  private difficulty: MouthAttentionDifficulty = 'easy';

  private startMs = Date.now();
  private lastMs = this.startMs;
  private lastInteractionMs = this.startMs;
  private lastPromptMs = this.startMs;

  private interactionCount = 0;
  private attentionShiftCount = 0;
  private progress = 0;
  private engagement = 0.2;

  private rewardState: MouthAttentionRewardState = 'NONE';
  private rewardPulse = false;
  private helperVisible = false;
  private promptTarget: MouthAttentionTarget = 'mouth';
  private state: MouthAttentionSnapshot['state'] = 'IDLE';

  private helperCount = 0;

  constructor(gameId: MouthAttentionGameId) {
    this.gameId = gameId;
  }

  configure(difficulty: MouthAttentionDifficulty) {
    this.difficulty = difficulty;
  }

  reset() {
    this.startMs = Date.now();
    this.lastMs = this.startMs;
    this.lastInteractionMs = this.startMs;
    this.lastPromptMs = this.startMs;
    this.interactionCount = 0;
    this.attentionShiftCount = 0;
    this.progress = 0;
    this.engagement = 0.2;
    this.rewardState = 'NONE';
    this.rewardPulse = false;
    this.helperVisible = false;
    this.promptTarget = 'mouth';
    this.state = 'IDLE';
    this.helperCount = 0;
  }

  setPaused(paused: boolean) {
    this.state = paused ? 'PAUSED' : 'SHOWING_PROMPT';
  }

  showPrompt(target?: MouthAttentionTarget, now = Date.now()) {
    this.promptTarget = target ?? TARGETS[(this.attentionShiftCount + 1) % TARGETS.length] ?? 'mouth';
    this.lastPromptMs = now;
    this.state = 'SHOWING_PROMPT';
    this.helperVisible = false;
  }

  /** Counts any attempt as success participation */
  interact(now = Date.now()) {
    this.interactionCount += 1;
    this.lastInteractionMs = now;
    this.helperVisible = false;
    this.engagement = clamp01(this.engagement + (this.engagement < 0.65 ? 0.06 : 0.03));

    // approximate shifting count
    if (this.interactionCount === 1 || this.interactionCount % 2 === 0) {
      this.attentionShiftCount += 1;
      this.promptTarget = TARGETS[this.attentionShiftCount % TARGETS.length] ?? 'mouth';
    }

    // progress and reward cadence
    this.progress = clamp01(this.progress + 0.17);
    const rewardEvery = this.difficulty === 'easy' ? 1 : this.difficulty === 'medium' ? 2 : 3;
    if (this.interactionCount % rewardEvery === 0) {
      this.triggerReward(this.progress >= 0.85 ? 'TREASURE' : this.progress >= 0.45 ? 'STAR' : 'SPARKLE');
    }

    this.state = 'WAITING_FOR_INTERACTION';
  }

  triggerReward(kind: MouthAttentionRewardState) {
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

  tick(now = Date.now()): MouthAttentionSnapshot {
    const dt = Math.max(0, now - this.lastMs);
    this.lastMs = now;

    if (this.state === 'IDLE') this.state = 'SHOWING_PROMPT';

    if (this.state !== 'PAUSED') {
      this.engagement = clamp01(this.engagement + dt * 0.00012); // passive viewing counts

      const idleMs = now - this.lastInteractionMs;
      const helperDelay = this.difficulty === 'easy' ? 2800 : this.difficulty === 'medium' ? 3200 : 3600;
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
      attentionShiftCount: this.attentionShiftCount,
      rewardState: this.rewardState,
      rewardPulse: this.rewardPulse,
      promptTarget: this.promptTarget,
      helperVisible: this.helperVisible,
      engagementTimeMs: now - this.startMs,
    };
  }

  getAnalytics(completedGames = 0): MouthAttentionAnalytics {
    return {
      engagementTimeMs: Date.now() - this.startMs,
      interactionCount: this.interactionCount,
      attentionShiftCount: this.attentionShiftCount,
      completedGames,
      helperCount: this.helperCount,
      lastUpdated: Date.now(),
    };
  }
}

