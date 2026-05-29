import { LipHoldStateMachine } from './lipHoldStateMachine';
import { saveLipHoldAnalytics } from './lipHoldAnalytics';
import { RewardManager } from './RewardManager';
import type { LipHoldDifficulty, LipHoldGameId, LipHoldGameState } from './lipHoldTypes';

export function holdDifficultyMs(level: LipHoldDifficulty): number {
  switch (level) {
    case 'easy':
      return 2000;
    case 'hard':
      return 8000;
    default:
      return 4000;
  }
}

export function statueDifficultyMs(level: LipHoldDifficulty): number {
  switch (level) {
    case 'easy':
      return 2000;
    case 'hard':
      return 10000;
    default:
      return 5000;
  }
}

export function holdRoundDifficulty(round: number): LipHoldDifficulty {
  if (round <= 1) return 'easy';
  if (round === 2) return 'medium';
  return 'hard';
}

/** Session game manager (spec: Session32GameManager). */
export class LipHoldSessionManager {
  readonly fsm = new LipHoldStateMachine();
  readonly rewards = new RewardManager();
  attemptCount = 0;
  longestHold = 0;
  successCount = 0;
  microBreaks = 0;

  constructor(
    readonly gameId: LipHoldGameId,
    readonly rounds = 3,
  ) {}

  get state(): LipHoldGameState {
    return this.fsm.state;
  }

  startDetecting() {
    this.fsm.transition('DETECTING');
    this.attemptCount += 1;
    this.rewards.onAttempt();
  }

  onStable() {
    if (this.fsm.state === 'DETECTING' || this.fsm.state === 'WARNING') {
      this.fsm.transition('STABLE');
    }
  }

  onWarning() {
    if (this.fsm.canTransition('WARNING')) this.fsm.transition('WARNING');
  }

  showHelp() {
    if (this.fsm.canTransition('HELPING')) this.fsm.transition('HELPING');
  }

  recordHold(holdMs: number, stabilityScore: number) {
    this.longestHold = Math.max(this.longestHold, holdMs);
    if (stabilityScore < 0.5) this.microBreaks += 1;
  }

  async markSuccess(holdMs: number, stabilityScore: number) {
    this.successCount += 1;
    this.rewards.onSuccess(holdMs);
    this.fsm.transition('SUCCESS');
    this.fsm.transition('REWARDING');
    await saveLipHoldAnalytics(this.gameId, {
      attemptCount: this.attemptCount,
      holdDuration: holdMs,
      microBreaks: this.microBreaks,
      averageStability: stabilityScore,
    });
  }

  resetRound() {
    this.fsm.reset();
    this.rewards.reset();
  }
}
