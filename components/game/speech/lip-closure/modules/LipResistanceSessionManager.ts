import { LipResistanceStateMachine } from './lipResistanceStateMachine';
import { saveLipResistanceAnalytics } from './lipResistanceAnalytics';
import { RewardManager } from './RewardManager';
import type { LipResistanceDifficulty, LipResistanceGameId, LipResistanceGameState } from './lipResistanceTypes';

export function resistanceDifficultyMs(level: LipResistanceDifficulty): number {
  switch (level) {
    case 'easy':
      return 2000;
    case 'hard':
      return 8000;
    default:
      return 4000;
  }
}

export function resistanceRoundDifficulty(round: number): LipResistanceDifficulty {
  if (round <= 1) return 'easy';
  if (round === 2) return 'medium';
  return 'hard';
}

/** Session game manager (spec: Session36GameManager). */
export class LipResistanceSessionManager {
  readonly fsm = new LipResistanceStateMachine();
  readonly rewards = new RewardManager();
  attemptCount = 0;
  successCount = 0;

  constructor(
    readonly gameId: LipResistanceGameId,
    readonly rounds = 3,
  ) {}

  get state(): LipResistanceGameState {
    return this.fsm.state;
  }

  startDetecting() {
    this.fsm.transition('DETECTING');
    this.attemptCount += 1;
    this.rewards.onAttempt();
  }

  onHolding() {
    if (this.fsm.state === 'DETECTING' || this.fsm.state === 'WARNING') {
      this.fsm.transition('HOLDING');
    }
  }

  onWarning() {
    if (this.fsm.canTransition('WARNING')) this.fsm.transition('WARNING');
  }

  showHelp() {
    if (this.fsm.canTransition('HELPING')) this.fsm.transition('HELPING');
  }

  async markSuccess(holdMs: number, stabilityScore: number) {
    this.successCount += 1;
    this.rewards.onSuccess(holdMs);
    this.fsm.transition('SUCCESS');
    this.fsm.transition('REWARDING');
    await saveLipResistanceAnalytics(this.gameId, {
      attemptCount: this.attemptCount,
      averageHoldTime: holdMs,
      stabilityScore,
    });
  }

  resetRound() {
    this.fsm.reset();
    this.rewards.reset();
  }
}
