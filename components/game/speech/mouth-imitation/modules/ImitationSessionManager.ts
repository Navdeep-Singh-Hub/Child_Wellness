import type { ImitationAnalyticsRecord, ImitationDifficulty, ImitationGameId } from './imitationTypes';

export function imitationRoundDifficulty(round: number): ImitationDifficulty {
  if (round <= 1) return 'easy';
  if (round === 2) return 'medium';
  return 'hard';
}

export class ImitationSessionManager {
  readonly gameId: ImitationGameId;
  readonly rounds: number;
  private round = 1;
  private interactionsThisRound = 0;
  private totalInteractions = 0;
  private sessionStart = Date.now();
  private analytics: ImitationAnalyticsRecord = {
    attemptCount: 0,
    engagementTimeMs: 0,
    gameCompletion: 0,
    interactionPatterns: [],
    lastUpdated: Date.now(),
  };

  constructor(gameId: ImitationGameId, rounds = 3) {
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

  recordAttempt(poseLabel: string) {
    this.interactionsThisRound += 1;
    this.totalInteractions += 1;
    this.analytics.attemptCount += 1;
    this.analytics.interactionPatterns.push(poseLabel);
    if (this.analytics.interactionPatterns.length > 40) {
      this.analytics.interactionPatterns = this.analytics.interactionPatterns.slice(-40);
    }
    this.analytics.engagementTimeMs = Date.now() - this.sessionStart;
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

  markComplete() {
    this.analytics.gameCompletion = 1;
    this.analytics.lastUpdated = Date.now();
  }

  getAnalytics() {
    return { ...this.analytics };
  }

  accuracyPercent() {
    return Math.min(100, 65 + this.totalInteractions * 7);
  }
}
