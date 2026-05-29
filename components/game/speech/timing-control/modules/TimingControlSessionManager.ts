import type {
  TimingControlAnalytics,
  TimingControlDifficulty,
  TimingControlGameId,
} from './timingControlTypes';

export function timingControlRoundDifficulty(round: number): TimingControlDifficulty {
  if (round <= 1) return 'easy';
  if (round === 2) return 'medium';
  return 'hard';
}

export class TimingControlSessionManager {
  readonly gameId: TimingControlGameId;
  readonly rounds: number;
  private round = 1;
  private interactionsThisRound = 0;
  private totalInteractions = 0;
  private analytics: TimingControlAnalytics = {
    engagementTimeMs: 0,
    timingAttempts: 0,
    coordinationAttempts: 0,
    gameCompletion: 0,
    timingProgress: 0,
    helperCount: 0,
    lastUpdated: Date.now(),
  };

  constructor(gameId: TimingControlGameId, rounds = 3) {
    this.gameId = gameId;
    this.rounds = rounds;
  }

  get interactionsNeeded() {
    return 3;
  }

  startRound() {
    this.interactionsThisRound = 0;
  }

  recordAttempt(timingProgress: number) {
    this.interactionsThisRound += 1;
    this.totalInteractions += 1;
    this.analytics.timingAttempts += 1;
    this.analytics.coordinationAttempts += 1;
    this.analytics.timingProgress = Math.max(this.analytics.timingProgress, timingProgress);
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
    return Math.min(100, 55 + this.totalInteractions * 12);
  }

  getAnalytics() {
    return { ...this.analytics };
  }
}
