import type {
  TongueAwarenessAnalytics,
  TongueAwarenessDifficulty,
  TongueAwarenessGameId,
} from './tongueAwarenessTypes';

export function tongueAwarenessRoundDifficulty(round: number): TongueAwarenessDifficulty {
  if (round <= 1) return 'easy';
  if (round === 2) return 'medium';
  return 'hard';
}

export class TongueAwarenessSessionManager {
  readonly gameId: TongueAwarenessGameId;
  readonly rounds: number;
  private round = 1;
  private interactionsThisRound = 0;
  private totalInteractions = 0;
  private completedGames = 0;
  private analytics: TongueAwarenessAnalytics = {
    engagementTimeMs: 0,
    interactionCount: 0,
    explorationPatterns: [],
    completedGames: 0,
    helperCount: 0,
    lastUpdated: Date.now(),
  };

  constructor(gameId: TongueAwarenessGameId, rounds = 3) {
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

  recordExploration(pattern: string) {
    if (!this.analytics.explorationPatterns.includes(pattern)) {
      this.analytics.explorationPatterns = [...this.analytics.explorationPatterns, pattern];
      this.analytics.lastUpdated = Date.now();
    }
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

  mergeAnalytics(partial: TongueAwarenessAnalytics) {
    this.analytics = { ...this.analytics, ...partial, lastUpdated: Date.now() };
  }

  getAnalytics() {
    return { ...this.analytics };
  }

  accuracyPercent() {
    return Math.min(100, 58 + this.totalInteractions * 10 + this.analytics.explorationPatterns.length * 3);
  }
}
