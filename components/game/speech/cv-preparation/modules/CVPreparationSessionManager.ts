import type {
  CVPreparationAnalytics,
  CVPreparationDifficulty,
  CVPreparationGameId,
} from './cvPreparationTypes';

export function cvPreparationRoundDifficulty(round: number): CVPreparationDifficulty {
  if (round <= 1) return 'easy';
  if (round === 2) return 'medium';
  return 'hard';
}

export class CVPreparationSessionManager {
  readonly gameId: CVPreparationGameId;
  readonly rounds: number;
  private round = 1;
  private interactionsThisRound = 0;
  private totalAttempts = 0;
  private analytics: CVPreparationAnalytics = {
    engagementTimeMs: 0,
    vocalAttempts: 0,
    imitationAttempts: 0,
    sequenceProgress: 0,
    patternExposure: [],
    completedGames: 0,
    helperCount: 0,
    lastUpdated: Date.now(),
  };

  constructor(gameId: CVPreparationGameId, rounds = 3) {
    this.gameId = gameId;
    this.rounds = rounds;
  }

  get interactionsNeeded() {
    return 3;
  }

  startRound() {
    this.interactionsThisRound = 0;
  }

  recordAttempt(patternExposure: string[], vocal = false, sequenceProgress = 0) {
    this.interactionsThisRound += 1;
    this.totalAttempts += 1;
    this.analytics.imitationAttempts = this.totalAttempts;
    if (vocal) this.analytics.vocalAttempts += 1;
    this.analytics.sequenceProgress = Math.max(this.analytics.sequenceProgress, sequenceProgress);
    for (const p of patternExposure) {
      if (!this.analytics.patternExposure.includes(p)) {
        this.analytics.patternExposure = [...this.analytics.patternExposure, p];
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
    const exp = this.analytics.patternExposure.length;
    return Math.min(100, 50 + this.totalAttempts * 10 + exp * 5);
  }
}
