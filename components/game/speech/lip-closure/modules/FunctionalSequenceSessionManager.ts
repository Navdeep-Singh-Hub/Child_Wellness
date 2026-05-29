import { FunctionalSequenceEngine } from './FunctionalSequenceEngine';
import { saveFunctionalSequenceAnalytics } from './functionalSequenceAnalytics';
import type {
  FunctionalSequenceGameId,
  FunctionalSequenceStep,
} from './functionalSequenceTypes';
import { RewardManager } from './RewardManager';

/** Session game manager (spec: Session40GameManager). */
export class FunctionalSequenceSessionManager {
  readonly engine = new FunctionalSequenceEngine();
  readonly rewards = new RewardManager();

  constructor(
    readonly gameId: FunctionalSequenceGameId,
    readonly rounds = 3,
  ) {}

  startRound(steps: FunctionalSequenceStep[]) {
    this.engine.startSession(steps);
    this.rewards.onAttempt();
  }

  async recordSuccess(smoothness: number, coordination: number) {
    this.rewards.onSuccess(Math.round(coordination * 5000));
    await saveFunctionalSequenceAnalytics(this.gameId, {
      sequenceCompletionRate: 1,
      transitionSmoothness: smoothness,
      coordinationScore: coordination,
      holdPerformance: coordination,
      attemptCount: this.engine.attemptCount,
      fatigueIndicators: this.engine.fatigueIndicators,
    });
  }

  resetRound() {
    this.engine.reset();
    this.rewards.reset();
  }
}

export type SequenceDifficulty = 'easy' | 'medium' | 'hard';

export function sequenceDifficulty(round: number): SequenceDifficulty {
  if (round <= 1) return 'easy';
  if (round === 2) return 'medium';
  return 'hard';
}
