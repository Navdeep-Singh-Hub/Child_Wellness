import type {
  ParticipationType,
  SpeechReadinessCompletionAnalytics,
  SpeechReadinessCompletionDifficulty,
  SpeechReadinessCompletionGameId,
} from './speechReadinessCompletionTypes';

export function speechReadinessRoundDifficulty(round: number): SpeechReadinessCompletionDifficulty {
  if (round <= 1) return 'easy';
  if (round === 2) return 'medium';
  return 'hard';
}

export class SpeechReadinessCompletionSessionManager {
  readonly gameId: SpeechReadinessCompletionGameId;
  readonly rounds: number;
  private round = 1;
  private interactionsThisRound = 0;
  private totalInteractions = 0;
  private analytics: SpeechReadinessCompletionAnalytics = {
    vocalAttempts: 0,
    imitationAttempts: 0,
    engagementTimeMs: 0,
    participationLevel: 0.3,
    averageDuration: 0,
    averageIntensity: 0,
    completedGames: 0,
    lastUpdated: Date.now(),
  };

  constructor(gameId: SpeechReadinessCompletionGameId, rounds = 3) {
    this.gameId = gameId;
    this.rounds = rounds;
  }

  get interactionsNeeded() {
    return 3;
  }

  startRound() {
    this.interactionsThisRound = 0;
  }

  recordParticipation(type: ParticipationType, intensity: number, durationMs: number) {
    this.interactionsThisRound += 1;
    this.totalInteractions += 1;
    if (type === 'vocal') {
      this.analytics.vocalAttempts += 1;
    } else {
      this.analytics.imitationAttempts += 1;
    }
    const n = this.analytics.vocalAttempts + this.analytics.imitationAttempts;
    this.analytics.averageIntensity =
      (this.analytics.averageIntensity * (n - 1) + intensity) / n;
    this.analytics.averageDuration =
      (this.analytics.averageDuration * (n - 1) + durationMs) / n;
    this.analytics.participationLevel = Math.min(1, 0.3 + n * 0.1);
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
    return Math.min(100, 58 + this.totalInteractions * 11);
  }
}
