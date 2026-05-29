import type {
  VowelShapingAnalytics,
  VowelShapingDifficulty,
  VowelShapingGameId,
} from './vowelShapingTypes';

export function vowelShapingRoundDifficulty(round: number): VowelShapingDifficulty {
  if (round <= 1) return 'easy';
  if (round === 2) return 'medium';
  return 'hard';
}

export class VowelShapingSessionManager {
  readonly gameId: VowelShapingGameId;
  readonly rounds: number;
  private round = 1;
  private interactionsThisRound = 0;
  private totalImitations = 0;
  private analytics: VowelShapingAnalytics = {
    engagementTimeMs: 0,
    imitationAttempts: 0,
    vocalAttempts: 0,
    vowelExposure: [],
    completedGames: 0,
    helperCount: 0,
    lastUpdated: Date.now(),
  };

  constructor(gameId: VowelShapingGameId, rounds = 3) {
    this.gameId = gameId;
    this.rounds = rounds;
  }

  get interactionsNeeded() {
    return 3;
  }

  startRound() {
    this.interactionsThisRound = 0;
  }

  recordImitation(vowelExposure: string[], vocal = false) {
    this.interactionsThisRound += 1;
    this.totalImitations += 1;
    this.analytics.imitationAttempts = this.totalImitations;
    if (vocal) this.analytics.vocalAttempts += 1;
    for (const v of vowelExposure) {
      if (!this.analytics.vowelExposure.includes(v)) {
        this.analytics.vowelExposure = [...this.analytics.vowelExposure, v];
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
    const exp = this.analytics.vowelExposure.length;
    return Math.min(100, 50 + this.totalImitations * 10 + exp * 5);
  }
}
