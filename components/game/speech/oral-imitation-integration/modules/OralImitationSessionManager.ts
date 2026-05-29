import type {
  OralImitationAnalytics,
  OralImitationDifficulty,
  OralImitationGameId,
} from './oralImitationTypes';

export function oralImitationRoundDifficulty(round: number): OralImitationDifficulty {
  if (round <= 1) return 'easy';
  if (round === 2) return 'medium';
  return 'hard';
}

export class OralImitationSessionManager {
  readonly gameId: OralImitationGameId;
  readonly rounds: number;
  private round = 1;
  private interactionsThisRound = 0;
  private totalInteractions = 0;
  private totalImitationAttempts = 0;
  private completedGames = 0;
  private analytics: OralImitationAnalytics = {
    engagementTimeMs: 0,
    interactionCount: 0,
    imitationAttempts: 0,
    completedGames: 0,
    helperCount: 0,
    lastUpdated: Date.now(),
  };

  constructor(gameId: OralImitationGameId, rounds = 3) {
    this.gameId = gameId;
    this.rounds = rounds;
  }

  get currentRound() {
    return this.round;
  }

  get interactionsNeeded() {
    return 3;
  }

  startRound() {
    this.interactionsThisRound = 0;
  }

  recordInteraction() {
    this.interactionsThisRound += 1;
    this.totalInteractions += 1;
    this.totalImitationAttempts += 1;
    this.analytics.interactionCount = this.totalInteractions;
    this.analytics.imitationAttempts = this.totalImitationAttempts;
    this.analytics.lastUpdated = Date.now();
  }

  markComplete() {
    this.completedGames += 1;
    this.analytics.completedGames = this.completedGames;
    this.analytics.lastUpdated = Date.now();
  }

  isRoundComplete() {
    return this.interactionsThisRound >= this.interactionsNeeded;
  }

  advanceRound() {
    if (this.round < this.rounds) {
      this.round += 1;
      this.interactionsThisRound = 0;
      return true;
    }
    return false;
  }

  mergeAnalytics(partial: OralImitationAnalytics) {
    this.analytics = { ...this.analytics, ...partial, lastUpdated: Date.now() };
  }

  getAnalytics() {
    return { ...this.analytics };
  }

  accuracyPercent() {
    return Math.min(100, 55 + this.totalInteractions * 10 + this.totalImitationAttempts * 4);
  }
}
