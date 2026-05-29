import { LipTransitionStateMachine } from './lipTransitionStateMachine';
import { saveLipTransitionAnalytics } from './lipTransitionAnalytics';
import { RewardManager } from './RewardManager';
import type { LipTransitionGameId, LipTransitionGameState } from './lipTransitionTypes';

/** Session game manager (spec: Session35GameManager). */
export class LipTransitionSessionManager {
  readonly fsm = new LipTransitionStateMachine();
  readonly rewards = new RewardManager();
  attemptCount = 0;
  successCount = 0;
  microBreaks = 0;
  transitionCount = 0;

  constructor(
    readonly gameId: LipTransitionGameId,
    readonly rounds = 3,
  ) {}

  get state(): LipTransitionGameState {
    return this.fsm.state;
  }

  startDetecting() {
    this.fsm.transition('DETECTING');
    this.attemptCount += 1;
    this.rewards.onAttempt();
  }

  onTransitioning() {
    if (this.fsm.state === 'DETECTING' || this.fsm.state === 'WARNING') {
      this.fsm.transition('TRANSITIONING');
    }
    this.transitionCount += 1;
  }

  onWarning() {
    if (this.fsm.canTransition('WARNING')) this.fsm.transition('WARNING');
    this.microBreaks += 1;
  }

  showHelp() {
    if (this.fsm.canTransition('HELPING')) this.fsm.transition('HELPING');
  }

  async markSuccess(successRate: number, avgSpeedMs: number) {
    this.successCount += 1;
    this.rewards.onSuccess(avgSpeedMs);
    this.fsm.transition('SUCCESS');
    this.fsm.transition('REWARDING');
    await saveLipTransitionAnalytics(this.gameId, {
      attemptCount: this.attemptCount,
      transitionSuccessRate: successRate,
      averageTransitionSpeed: avgSpeedMs,
      microBreaks: this.microBreaks,
    });
  }

  resetRound() {
    this.fsm.reset();
    this.rewards.reset();
    this.transitionCount = 0;
  }
}
