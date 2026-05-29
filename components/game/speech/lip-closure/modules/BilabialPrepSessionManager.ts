import { BilabialEngine } from './BilabialEngine';
import { saveBilabialPrepAnalytics } from './lipBilabialAnalytics';
import { RewardManager } from './RewardManager';
import type { BilabialPrepGameId, BilabialPrepGameState } from './lipBilabialTypes';

/** Session game manager (spec: Session37GameManager). */
export class BilabialPrepSessionManager {
  readonly engine = new BilabialEngine();
  readonly rewards = new RewardManager();

  constructor(
    readonly gameId: BilabialPrepGameId,
    readonly rounds = 3,
  ) {}

  get state(): BilabialPrepGameState {
    return this.engine.state;
  }

  startRound() {
    this.engine.startSession();
    this.rewards.onAttempt();
  }

  async recordSuccess(timingMs: number) {
    this.rewards.onSuccess(timingMs);
    await saveBilabialPrepAnalytics(this.gameId, {
      bilabialAttempts: this.engine.attemptCount,
      successfulEvents: this.engine.successCount,
      averageTiming: timingMs,
      microBreaks: this.engine.microBreaks,
    });
  }

  resetRound() {
    this.engine.reset();
    this.rewards.reset();
  }
}
