import type {
  LipAwarenessAnalyticsRecord,
  LipAwarenessGameId,
  LipDifficulty,
} from './lipAwarenessTypes';

export function lipAwarenessRoundDifficulty(round: number): LipDifficulty {
  if (round <= 1) return 'easy';
  if (round === 2) return 'medium';
  return 'hard';
}

export class LipAwarenessSessionManager {
  readonly gameId: LipAwarenessGameId;
  readonly rounds: number;
  private round = 1;
  private interactionsThisRound = 0;
  private totalInteractions = 0;
  private sessionStart = Date.now();
  private analytics: LipAwarenessAnalyticsRecord = {
    interactionCount: 0,
    engagementTimeMs: 0,
    gameCompletion: 0,
    playPatterns: [],
    lastUpdated: Date.now(),
  };

  constructor(gameId: LipAwarenessGameId, rounds = 3) {
    this.gameId = gameId;
    this.rounds = rounds;
  }

  get interactionsNeeded() {
    return 3;
  }

  startRound() {
    this.interactionsThisRound = 0;
  }

  recordInteraction(pattern: string) {
    this.interactionsThisRound += 1;
    this.totalInteractions += 1;
    this.analytics.interactionCount += 1;
    this.analytics.playPatterns.push(pattern);
    if (this.analytics.playPatterns.length > 40) {
      this.analytics.playPatterns = this.analytics.playPatterns.slice(-40);
    }
    this.analytics.engagementTimeMs = Date.now() - this.sessionStart;
    this.analytics.lastUpdated = Date.now();
  }

  markComplete() {
    this.analytics.gameCompletion = 1;
    this.analytics.lastUpdated = Date.now();
  }

  getAnalytics() {
    return { ...this.analytics };
  }

  accuracyPercent() {
    return Math.min(100, 68 + this.totalInteractions * 7);
  }

  advanceRound() {
    if (this.round < this.rounds) {
      this.round += 1;
      this.interactionsThisRound = 0;
      return true;
    }
    return false;
  }
}
