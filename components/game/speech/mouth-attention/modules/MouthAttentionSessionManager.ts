import type {
  MouthAttentionAnalytics,
  MouthAttentionDifficulty,
  MouthAttentionGameId,
} from './mouthAttentionTypes';

export function mouthAttentionRoundDifficulty(round: number): MouthAttentionDifficulty {
  if (round <= 1) return 'easy';
  if (round === 2) return 'medium';
  return 'hard';
}

export class MouthAttentionSessionManager {
  readonly gameId: MouthAttentionGameId;
  readonly rounds: number;
  private round = 1;
  private interactionsThisRound = 0;
  private totalInteractions = 0;
  private totalShifts = 0;
  private completedGames = 0;
  private analytics: MouthAttentionAnalytics = {
    engagementTimeMs: 0,
    interactionCount: 0,
    attentionShiftCount: 0,
    completedGames: 0,
    helperCount: 0,
    lastUpdated: Date.now(),
  };

  constructor(gameId: MouthAttentionGameId, rounds = 3) {
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

  recordAttentionShift() {
    this.totalShifts += 1;
    this.analytics.attentionShiftCount = this.totalShifts;
    this.analytics.lastUpdated = Date.now();
  }

  markComplete() {
    this.completedGames += 1;
    this.analytics.completedGames = this.completedGames;
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

  mergeAnalytics(partial: MouthAttentionAnalytics) {
    this.analytics = { ...this.analytics, ...partial, lastUpdated: Date.now() };
  }

  getAnalytics() {
    return { ...this.analytics };
  }

  /** effort-based stars only; no correctness */
  accuracyPercent() {
    return Math.min(100, 60 + this.totalInteractions * 9 + this.totalShifts * 2);
  }
}

