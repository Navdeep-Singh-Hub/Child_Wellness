import type {
  FunctionalCoordinationAnalytics,
  FunctionalCoordinationDifficulty,
  FunctionalCoordinationGameId,
} from './functionalCoordinationTypes';

export function functionalCoordinationRoundDifficulty(round: number): FunctionalCoordinationDifficulty {
  if (round <= 1) return 'easy';
  if (round === 2) return 'medium';
  return 'hard';
}

export class FunctionalCoordinationSessionManager {
  readonly gameId: FunctionalCoordinationGameId;
  readonly rounds: number;
  private round = 1;
  private interactionsThisRound = 0;
  private totalInteractions = 0;
  private analytics: FunctionalCoordinationAnalytics = {
    engagementTimeMs: 0,
    coordinationAttempts: 0,
    sequenceAttempts: 0,
    gameCompletion: 0,
    coordinationProgress: 0,
    helperCount: 0,
    lastUpdated: Date.now(),
  };

  constructor(gameId: FunctionalCoordinationGameId, rounds = 3) {
    this.gameId = gameId;
    this.rounds = rounds;
  }

  startRound() {
    this.interactionsThisRound = 0;
  }

  recordAttempt(coordinationProgress: number) {
    this.interactionsThisRound += 1;
    this.totalInteractions += 1;
    this.analytics.coordinationAttempts += 1;
    this.analytics.sequenceAttempts += 1;
    this.analytics.coordinationProgress = Math.max(this.analytics.coordinationProgress, coordinationProgress);
    this.analytics.lastUpdated = Date.now();
  }

  markComplete() {
    this.analytics.gameCompletion += 1;
    this.analytics.lastUpdated = Date.now();
  }

  advanceRound() {
    if (this.round < this.rounds) {
      this.round += 1;
      this.interactionsThisRound = 0;
      return true;
    }
    return false;
  }

  accuracyPercent() {
    return Math.min(100, 58 + this.totalInteractions * 11);
  }

  getAnalytics() {
    return { ...this.analytics };
  }
}
