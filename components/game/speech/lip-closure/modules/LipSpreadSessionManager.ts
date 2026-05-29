import { LipSpreadStateMachine } from './lipSpreadStateMachine';
import { saveLipSpreadAnalytics } from './lipSpreadAnalytics';
import { RewardManager } from './RewardManager';
import type { LipSpreadDifficulty, LipSpreadGameId, LipSpreadGameState } from './lipSpreadTypes';

export function spreadDifficultyMs(level: LipSpreadDifficulty): number {
  switch (level) {
    case 'easy':
      return 2000;
    case 'hard':
      return 8000;
    default:
      return 4000;
  }
}

export function spreadRoundDifficulty(round: number): LipSpreadDifficulty {
  if (round <= 1) return 'easy';
  if (round === 2) return 'medium';
  return 'hard';
}

/** Session game manager (spec: Session34GameManager). */
export class LipSpreadSessionManager {
  readonly fsm = new LipSpreadStateMachine();
  readonly rewards = new RewardManager();
  attemptCount = 0;
  longestHold = 0;
  successCount = 0;
  microBreaks = 0;

  constructor(
    readonly gameId: LipSpreadGameId,
    readonly rounds = 3,
  ) {}

  get state(): LipSpreadGameState {
    return this.fsm.state;
  }

  startDetecting() {
    this.fsm.transition('DETECTING');
    this.attemptCount += 1;
    this.rewards.onAttempt();
  }

  onSpreading() {
    if (this.fsm.state === 'DETECTING' || this.fsm.state === 'WARNING') {
      this.fsm.transition('SPREADING');
    }
  }

  onWarning() {
    if (this.fsm.canTransition('WARNING')) this.fsm.transition('WARNING');
  }

  showHelp() {
    if (this.fsm.canTransition('HELPING')) this.fsm.transition('HELPING');
  }

  async markSuccess(holdMs: number, spreadScore: number) {
    this.successCount += 1;
    this.longestHold = Math.max(this.longestHold, holdMs);
    this.rewards.onSuccess(holdMs);
    this.fsm.transition('SUCCESS');
    this.fsm.transition('REWARDING');
    await saveLipSpreadAnalytics(this.gameId, {
      attemptCount: this.attemptCount,
      holdDuration: holdMs,
      microBreaks: this.microBreaks,
      averageSpread: spreadScore,
    });
  }

  resetRound() {
    this.fsm.reset();
    this.rewards.reset();
  }
}
