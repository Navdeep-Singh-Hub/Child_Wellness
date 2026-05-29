import type {
  SpeechOralImitationAnalytics,
  SpeechOralImitationDifficulty,
  SpeechOralImitationGameId,
} from './speechOralImitationTypes';

export function speechOralImitationRoundDifficulty(round: number): SpeechOralImitationDifficulty {
  if (round <= 1) return 'easy';
  if (round === 2) return 'medium';
  return 'hard';
}

export class SpeechOralImitationSessionManager {
  readonly gameId: SpeechOralImitationGameId;
  readonly rounds: number;
  private round = 1;
  private interactionsThisRound = 0;
  private totalInteractions = 0;
  private totalImitationAttempts = 0;
  private completedGames = 0;
  private analytics: SpeechOralImitationAnalytics = {
    engagementTimeMs: 0,
    interactionCount: 0,
    imitationAttempts: 0,
    sequenceProgress: 0,
    completedGames: 0,
    helperCount: 0,
    lastUpdated: Date.now(),
  };

  constructor(gameId: SpeechOralImitationGameId, rounds = 3) {
    this.gameId = gameId;
    this.rounds = rounds;
  }

  get interactionsNeeded() {
    return 3;
  }

  startRound() {
    this.interactionsThisRound = 0;
  }

  recordImitation(sequenceProgress = 0) {
    this.interactionsThisRound += 1;
    this.totalInteractions += 1;
    this.totalImitationAttempts += 1;
    this.analytics.interactionCount = this.totalInteractions;
    this.analytics.imitationAttempts = this.totalImitationAttempts;
    this.analytics.sequenceProgress = Math.max(this.analytics.sequenceProgress, sequenceProgress);
    this.analytics.lastUpdated = Date.now();
  }

  markComplete() {
    this.completedGames += 1;
    this.analytics.completedGames = this.completedGames;
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

  getAnalytics() {
    return { ...this.analytics };
  }

  accuracyPercent() {
    return Math.min(100, 52 + this.totalImitationAttempts * 11 + this.totalInteractions * 5);
  }
}
