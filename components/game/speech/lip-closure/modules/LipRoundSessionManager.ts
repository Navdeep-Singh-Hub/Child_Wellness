import { LipRoundStateMachine } from './lipRoundStateMachine';
import { saveLipRoundAnalytics } from './lipRoundAnalytics';
import { RewardManager } from './RewardManager';
import type { LipRoundDifficulty, LipRoundGameId, LipRoundGameState } from './lipRoundTypes';

export function roundDifficultyMs(level: LipRoundDifficulty): number {
  switch (level) {
    case 'easy':
      return 2000;
    case 'hard':
      return 8000;
    default:
      return 4000;
  }
}

export function roundRoundDifficulty(round: number): LipRoundDifficulty {
  if (round <= 1) return 'easy';
  if (round === 2) return 'medium';
  return 'hard';
}

/** Session game manager (spec: Session33GameManager). */
export class LipRoundSessionManager {
  readonly fsm = new LipRoundStateMachine();
  readonly rewards = new RewardManager();
  attemptCount = 0;
  longestHold = 0;
  successCount = 0;
  microBreaks = 0;

  constructor(
    readonly gameId: LipRoundGameId,
    readonly rounds = 3,
  ) {}

  get state(): LipRoundGameState {
    return this.fsm.state;
  }

  startDetecting() {
    this.fsm.transition('DETECTING');
    this.attemptCount += 1;
    this.rewards.onAttempt();
  }

  onRounded() {
    if (this.fsm.state === 'DETECTING' || this.fsm.state === 'WARNING') {
      this.fsm.transition('ROUNDED');
    }
  }

  onWarning() {
    if (this.fsm.canTransition('WARNING')) this.fsm.transition('WARNING');
  }

  showHelp() {
    if (this.fsm.canTransition('HELPING')) this.fsm.transition('HELPING');
  }

  async markSuccess(holdMs: number, roundnessScore: number) {
    this.successCount += 1;
    this.longestHold = Math.max(this.longestHold, holdMs);
    this.rewards.onSuccess(holdMs);
    this.fsm.transition('SUCCESS');
    this.fsm.transition('REWARDING');
    await saveLipRoundAnalytics(this.gameId, {
      attemptCount: this.attemptCount,
      holdDuration: holdMs,
      microBreaks: this.microBreaks,
      averageRoundness: roundnessScore,
    });
  }

  resetRound() {
    this.fsm.reset();
    this.rewards.reset();
  }
}
