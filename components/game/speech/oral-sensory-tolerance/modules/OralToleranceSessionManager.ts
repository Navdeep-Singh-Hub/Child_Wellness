import type { OralToleranceAnalytics, OralToleranceDifficulty, OralToleranceGameId } from './oralSensoryTypes';

export function oralToleranceRoundDifficulty(round: number): OralToleranceDifficulty {
  if (round <= 1) return 'easy';
  if (round === 2) return 'medium';
  return 'hard';
}

export class OralToleranceSessionManager {
  readonly gameId: OralToleranceGameId;
  readonly rounds: number;
  private round = 1;
  private interactionsThisRound = 0;
  private totalInteractions = 0;
  private analytics: OralToleranceAnalytics = {
    engagementTimeMs: 0,
    interactionCount: 0,
    comfortAverage: 0.6,
    comfortMin: 0.6,
    rewardCount: 0,
    overwhelmEvents: 0,
    lastUpdated: Date.now(),
  };

  constructor(gameId: OralToleranceGameId, rounds = 3) {
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
    this.analytics.interactionCount = this.totalInteractions;
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

  mergeAnalytics(partial: OralToleranceAnalytics) {
    this.analytics = { ...this.analytics, ...partial, lastUpdated: Date.now() };
  }

  getAnalytics() {
    return { ...this.analytics };
  }

  /** Effort-based “accuracy” used only for stars; no correctness scoring. */
  accuracyPercent() {
    return Math.min(100, 62 + this.totalInteractions * 10);
  }
}

