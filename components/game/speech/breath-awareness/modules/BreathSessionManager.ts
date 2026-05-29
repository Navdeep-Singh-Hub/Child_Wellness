import type { BreathAnalyticsRecord, BreathDifficulty, BreathGameId } from './breathAwarenessTypes';

export function breathRoundDifficulty(round: number): BreathDifficulty {
  if (round <= 1) return 'easy';
  if (round === 2) return 'medium';
  return 'hard';
}

export class BreathSessionManager {
  readonly gameId: BreathGameId;
  readonly rounds: number;
  private round = 1;
  private interactionsThisRound = 0;
  private totalInteractions = 0;
  private analytics: BreathAnalyticsRecord = {
    breathAttempts: 0,
    engagementTimeMs: 0,
    interactionSuccess: 0,
    averageIntensity: 0,
    lastUpdated: Date.now(),
  };

  constructor(gameId: BreathGameId, rounds = 3) {
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

  recordInteraction(intensity: number) {
    this.interactionsThisRound += 1;
    this.totalInteractions += 1;
    this.analytics.breathAttempts += 1;
    this.analytics.interactionSuccess += 1;
    const n = this.analytics.breathAttempts;
    this.analytics.averageIntensity =
      (this.analytics.averageIntensity * (n - 1) + intensity) / n;
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

  mergeAnalytics(partial: BreathAnalyticsRecord) {
    this.analytics = { ...this.analytics, ...partial, lastUpdated: Date.now() };
  }

  getAnalytics() {
    return { ...this.analytics };
  }

  accuracyPercent() {
    return Math.min(100, 60 + this.totalInteractions * 8);
  }
}
