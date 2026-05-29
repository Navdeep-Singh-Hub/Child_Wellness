import type {
  TongueJawCoordinationAnalytics,
  TongueJawCoordinationDifficulty,
  TongueJawCoordinationGameId,
} from './tongueJawCoordinationTypes';

export function tongueJawRoundDifficulty(round: number): TongueJawCoordinationDifficulty {
  if (round <= 1) return 'easy';
  if (round === 2) return 'medium';
  return 'hard';
}

export class TongueJawCoordinationSessionManager {
  readonly gameId: TongueJawCoordinationGameId;
  readonly rounds: number;
  private round = 1;
  private interactionsThisRound = 0;
  private totalInteractions = 0;
  private analytics: TongueJawCoordinationAnalytics = {
    engagementTimeMs: 0,
    coordinationAttempts: 0,
    imitationAttempts: 0,
    sequenceProgress: 0,
    completedGames: 0,
    helperCount: 0,
    lastUpdated: Date.now(),
  };

  constructor(gameId: TongueJawCoordinationGameId, rounds = 3) {
    this.gameId = gameId;
    this.rounds = rounds;
  }

  get interactionsNeeded() {
    return 3;
  }

  startRound() {
    this.interactionsThisRound = 0;
  }

  recordCoordination(sequenceProgress: number) {
    this.interactionsThisRound += 1;
    this.totalInteractions += 1;
    this.analytics.coordinationAttempts += 1;
    this.analytics.imitationAttempts += 1;
    this.analytics.sequenceProgress = Math.max(this.analytics.sequenceProgress, sequenceProgress);
    this.analytics.lastUpdated = Date.now();
  }

  markComplete() {
    this.analytics.completedGames += 1;
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
    return Math.min(100, 55 + this.totalInteractions * 12);
  }

  getAnalytics() {
    return { ...this.analytics };
  }
}

