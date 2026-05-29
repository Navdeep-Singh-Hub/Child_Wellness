import type {
  BreathActivationAnalyticsRecord,
  BreathActivationDifficulty,
  BreathActivationGameId,
} from './breathActivationTypes';

export function breathActivationRoundDifficulty(round: number): BreathActivationDifficulty {
  if (round <= 1) return 'easy';
  if (round === 2) return 'medium';
  return 'hard';
}

export class BreathActivationSessionManager {
  readonly gameId: BreathActivationGameId;
  readonly rounds: number;
  private round = 1;
  private interactionsThisRound = 0;
  private totalInteractions = 0;
  private sessionStart = Date.now();
  private analytics: BreathActivationAnalyticsRecord = {
    breathAttempts: 0,
    engagementTimeMs: 0,
    interactionSuccess: 0,
    averageDuration: 0,
    lastUpdated: Date.now(),
  };

  constructor(gameId: BreathActivationGameId, rounds = 3) {
    this.gameId = gameId;
    this.rounds = rounds;
  }

  get interactionsNeeded() {
    return 3;
  }

  startRound() {
    this.interactionsThisRound = 0;
  }

  recordCycle(durationMs: number) {
    this.interactionsThisRound += 1;
    this.totalInteractions += 1;
    this.analytics.breathAttempts += 1;
    this.analytics.interactionSuccess += 1;
    const n = this.analytics.breathAttempts;
    this.analytics.averageDuration =
      (this.analytics.averageDuration * (n - 1) + durationMs) / n;
    this.analytics.engagementTimeMs = Date.now() - this.sessionStart;
    this.analytics.lastUpdated = Date.now();
  }

  getAnalytics() {
    return { ...this.analytics };
  }

  accuracyPercent() {
    return Math.min(100, 62 + this.totalInteractions * 8);
  }

  advanceRound() {
    if (this.round < this.rounds) {
      this.round += 1;
      this.interactionsThisRound = 0;
      return true;
    }
    return false;
  }
}
