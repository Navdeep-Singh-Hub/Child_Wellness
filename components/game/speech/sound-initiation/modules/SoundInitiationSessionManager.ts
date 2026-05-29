import type {
  SoundInitiationAnalytics,
  SoundInitiationDifficulty,
  SoundInitiationGameId,
} from './soundInitiationTypes';

export function soundInitiationRoundDifficulty(round: number): SoundInitiationDifficulty {
  if (round <= 1) return 'easy';
  if (round === 2) return 'medium';
  return 'hard';
}

export class SoundInitiationSessionManager {
  readonly gameId: SoundInitiationGameId;
  readonly rounds: number;
  private round = 1;
  private interactionsThisRound = 0;
  private totalInteractions = 0;
  private analytics: SoundInitiationAnalytics = {
    soundAttempts: 0,
    engagementTimeMs: 0,
    interactionCount: 0,
    averageDuration: 0,
    averageIntensity: 0,
    lastUpdated: Date.now(),
  };

  constructor(gameId: SoundInitiationGameId, rounds = 3) {
    this.gameId = gameId;
    this.rounds = rounds;
  }

  get interactionsNeeded() {
    return 3;
  }

  startRound() {
    this.interactionsThisRound = 0;
  }

  recordSound(intensity: number, durationMs: number) {
    this.interactionsThisRound += 1;
    this.totalInteractions += 1;
    const n = this.analytics.soundAttempts + 1;
    this.analytics.soundAttempts = n;
    this.analytics.interactionCount = n;
    this.analytics.averageIntensity =
      (this.analytics.averageIntensity * (n - 1) + intensity) / n;
    this.analytics.averageDuration =
      (this.analytics.averageDuration * (n - 1) + durationMs) / n;
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
