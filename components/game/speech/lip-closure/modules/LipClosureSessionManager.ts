import { LipStateMachine } from './lipStateMachine';
import { RewardManager } from './RewardManager';
import { saveLipAnalytics } from './lipAnalytics';
import type { LipDifficulty, LipGameId, LipGameState } from './types';

export function difficultyHoldMs(level: LipDifficulty): number {
  switch (level) {
    case 'easy':
      return 2000;
    case 'hard':
      return 5000;
    default:
      return 3000;
  }
}

export function roundDifficulty(round: number): LipDifficulty {
  if (round <= 1) return 'easy';
  if (round === 2) return 'medium';
  return 'hard';
}

/** Session game manager (spec: Session31GameManager). */
export class LipClosureSessionManager {
  readonly fsm = new LipStateMachine();
  readonly rewards = new RewardManager();
  attemptCount = 0;
  longestHold = 0;
  successCount = 0;

  constructor(
    readonly gameId: LipGameId,
    readonly rounds = 3,
  ) {}

  get state(): LipGameState {
    return this.fsm.state;
  }

  startDetecting() {
    this.fsm.transition('DETECTING');
    this.attemptCount += 1;
    this.rewards.onAttempt();
  }

  showHelp() {
    if (this.fsm.canTransition('HELPING')) this.fsm.transition('HELPING');
  }

  resumeFromHelp() {
    if (this.fsm.canTransition('DETECTING')) this.fsm.transition('DETECTING');
  }

  recordHold(holdMs: number) {
    this.longestHold = Math.max(this.longestHold, holdMs);
  }

  async markSuccess(holdMs: number) {
    this.successCount += 1;
    this.rewards.onSuccess(holdMs);
    this.fsm.transition('SUCCESS');
    this.fsm.transition('REWARDING');
    await saveLipAnalytics(this.gameId, {
      successfulClosures: this.successCount,
      attemptCount: this.attemptCount,
      averageHoldTime: holdMs,
    });
  }

  resetRound() {
    this.fsm.reset();
    this.rewards.reset();
  }
}
