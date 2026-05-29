import { LipCoordinationEngine } from './LipCoordinationEngine';
import { saveLipCoordinationAnalytics } from './lipCoordinationAnalytics';
import type {
  CoordinationPose,
  LipCoordinationGameId,
  RhythmDifficulty,
} from './lipCoordinationTypes';
import { RewardManager } from './RewardManager';

/** Session game manager (spec: Session39GameManager). */
export class LipCoordinationSessionManager {
  readonly engine = new LipCoordinationEngine();
  readonly rewards = new RewardManager();

  constructor(
    readonly gameId: LipCoordinationGameId,
    readonly rounds = 3,
  ) {}

  startRound(sequence: CoordinationPose[], rhythm?: RhythmDifficulty) {
    this.engine.startSession(sequence, rhythm);
    this.rewards.onAttempt();
  }

  async recordSuccess(coordScore: number, timingAccuracy: number) {
    this.rewards.onSuccess(Math.round(coordScore * 5000));
    await saveLipCoordinationAnalytics(this.gameId, {
      coordinationScore: coordScore,
      timingAccuracy,
      sequenceCompletionRate: 1,
      attemptCount: this.engine.attemptCount,
      fatigueIndicators: this.engine.fatigueIndicators,
    });
  }

  resetRound() {
    this.engine.reset();
    this.rewards.reset();
  }
}

export function coordinationDifficulty(round: number): RhythmDifficulty {
  if (round <= 1) return 'easy';
  if (round === 2) return 'medium';
  return 'hard';
}
