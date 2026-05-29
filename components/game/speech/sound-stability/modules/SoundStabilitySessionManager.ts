import type {
  SoundStabilityAnalytics,
  SoundStabilityDifficulty,
  SoundStabilityGameId,
} from './soundStabilityTypes';

export function soundStabilityRoundDifficulty(round: number): SoundStabilityDifficulty {
  if (round <= 1) return 'easy';
  if (round === 2) return 'medium';
  return 'hard';
}

export class SoundStabilitySessionManager {
  readonly gameId: SoundStabilityGameId;
  readonly rounds: number;
  private round = 1;
  private interactionsThisRound = 0;
  private totalInteractions = 0;
  private analytics: SoundStabilityAnalytics = {
    vocalAttempts: 0,
    sustainedDuration: 0,
    stabilityAttempts: 0,
    engagementTimeMs: 0,
    averageSustainMs: 0,
    completedGames: 0,
    lastUpdated: Date.now(),
  };

  constructor(gameId: SoundStabilityGameId, rounds = 3) {
    this.gameId = gameId;
    this.rounds = rounds;
  }

  get interactionsNeeded() {
    return 3;
  }

  startRound() {
    this.interactionsThisRound = 0;
  }

  recordStability(sustainMs: number, _intensity: number) {
    this.interactionsThisRound += 1;
    this.totalInteractions += 1;
    this.analytics.vocalAttempts += 1;
    this.analytics.stabilityAttempts += 1;
    this.analytics.sustainedDuration += sustainMs;
    const n = this.analytics.stabilityAttempts;
    this.analytics.averageSustainMs = this.analytics.sustainedDuration / n;
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
    return Math.min(100, 56 + this.totalInteractions * 11);
  }
}
