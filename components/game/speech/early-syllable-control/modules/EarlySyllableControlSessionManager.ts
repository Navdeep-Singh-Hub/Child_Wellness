import type {
  EarlySyllableControlAnalytics,
  EarlySyllableControlGameId,
  EarlySyllableDifficulty,
} from './earlySyllableControlTypes';

export function earlySyllableRoundDifficulty(round: number): EarlySyllableDifficulty {
  if (round <= 1) return 'easy';
  if (round === 2) return 'medium';
  return 'hard';
}

export class EarlySyllableControlSessionManager {
  readonly gameId: EarlySyllableControlGameId;
  readonly rounds: number;
  private round = 1;
  private interactionsThisRound = 0;
  private totalSyllableAttempts = 0;
  private analytics: EarlySyllableControlAnalytics = {
    engagementTimeMs: 0,
    vocalAttempts: 0,
    syllableAttempts: 0,
    sequenceProgress: 0,
    syllableExposure: [],
    completedGames: 0,
    helperCount: 0,
    lastUpdated: Date.now(),
  };

  constructor(gameId: EarlySyllableControlGameId, rounds = 3) {
    this.gameId = gameId;
    this.rounds = rounds;
  }

  get interactionsNeeded() {
    return 3;
  }

  startRound() {
    this.interactionsThisRound = 0;
  }

  recordSyllableAttempt(syllableExposure: string[], vocal = false, sequenceProgress = 0) {
    this.interactionsThisRound += 1;
    this.totalSyllableAttempts += 1;
    this.analytics.syllableAttempts = this.totalSyllableAttempts;
    if (vocal) this.analytics.vocalAttempts += 1;
    this.analytics.sequenceProgress = Math.max(this.analytics.sequenceProgress, sequenceProgress);
    for (const s of syllableExposure) {
      if (!this.analytics.syllableExposure.includes(s)) {
        this.analytics.syllableExposure = [...this.analytics.syllableExposure, s];
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
    const exp = this.analytics.syllableExposure.length;
    return Math.min(100, 50 + this.totalSyllableAttempts * 10 + exp * 5);
  }
}
