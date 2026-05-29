import type {
  FunctionalVocalIntentAnalytics,
  FunctionalVocalIntentDifficulty,
  FunctionalVocalIntentGameId,
} from './functionalVocalIntentTypes';

export function functionalVocalIntentRoundDifficulty(round: number): FunctionalVocalIntentDifficulty {
  if (round <= 1) return 'easy';
  if (round === 2) return 'medium';
  return 'hard';
}

export class FunctionalVocalIntentSessionManager {
  readonly gameId: FunctionalVocalIntentGameId;
  readonly rounds: number;
  private round = 1;
  private interactionsThisRound = 0;
  private totalInteractions = 0;
  private analytics: FunctionalVocalIntentAnalytics = {
    vocalAttempts: 0,
    interactionAttempts: 0,
    engagementTimeMs: 0,
    averageDuration: 0,
    averageIntensity: 0,
    completedGames: 0,
    lastUpdated: Date.now(),
  };

  constructor(gameId: FunctionalVocalIntentGameId, rounds = 3) {
    this.gameId = gameId;
    this.rounds = rounds;
  }

  get interactionsNeeded() {
    return 3;
  }

  startRound() {
    this.interactionsThisRound = 0;
  }

  recordInteraction(intensity: number, durationMs: number) {
    this.interactionsThisRound += 1;
    this.totalInteractions += 1;
    const n = this.analytics.vocalAttempts + 1;
    this.analytics.vocalAttempts = n;
    this.analytics.interactionAttempts = n;
    this.analytics.averageIntensity =
      (this.analytics.averageIntensity * (n - 1) + intensity) / n;
    this.analytics.averageDuration =
      (this.analytics.averageDuration * (n - 1) + durationMs) / n;
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

  isRoundComplete() {
    return this.interactionsThisRound >= this.interactionsNeeded;
  }

  getAnalytics() {
    return { ...this.analytics };
  }

  accuracyPercent() {
    return Math.min(100, 55 + this.totalInteractions * 12);
  }
}
