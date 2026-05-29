import type {
  BilabialSequencingAnalytics,
  BilabialSequencingDifficulty,
  BilabialSequencingGameId,
} from './bilabialSequencingTypes';

export function bilabialSequencingRoundDifficulty(round: number): BilabialSequencingDifficulty {
  if (round <= 1) return 'easy';
  if (round === 2) return 'medium';
  return 'hard';
}

export class BilabialSequencingSessionManager {
  readonly gameId: BilabialSequencingGameId;
  readonly rounds: number;
  private round = 1;
  private interactionsThisRound = 0;
  private totalRepetitions = 0;
  private analytics: BilabialSequencingAnalytics = {
    engagementTimeMs: 0,
    vocalAttempts: 0,
    repetitionAttempts: 0,
    sequenceProgress: 0,
    repeatExposure: [],
    completedGames: 0,
    helperCount: 0,
    lastUpdated: Date.now(),
  };

  constructor(gameId: BilabialSequencingGameId, rounds = 3) {
    this.gameId = gameId;
    this.rounds = rounds;
  }

  get interactionsNeeded() {
    return 3;
  }

  startRound() {
    this.interactionsThisRound = 0;
  }

  recordRepetition(repeatExposure: string[], vocal = false, sequenceProgress = 0) {
    this.interactionsThisRound += 1;
    this.totalRepetitions += 1;
    this.analytics.repetitionAttempts = this.totalRepetitions;
    if (vocal) this.analytics.vocalAttempts += 1;
    this.analytics.sequenceProgress = Math.max(this.analytics.sequenceProgress, sequenceProgress);
    for (const r of repeatExposure) {
      if (!this.analytics.repeatExposure.includes(r)) {
        this.analytics.repeatExposure = [...this.analytics.repeatExposure, r];
      }
    }
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
    const exp = this.analytics.repeatExposure.length;
    return Math.min(100, 50 + this.totalRepetitions * 10 + exp * 5);
  }
}
