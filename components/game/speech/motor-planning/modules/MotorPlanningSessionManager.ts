import type {
  MotorPlanningAnalytics,
  MotorPlanningDifficulty,
  MotorPlanningGameId,
} from './motorPlanningTypes';

export function motorPlanningRoundDifficulty(round: number): MotorPlanningDifficulty {
  if (round <= 1) return 'easy';
  if (round === 2) return 'medium';
  return 'hard';
}

export class MotorPlanningSessionManager {
  readonly gameId: MotorPlanningGameId;
  readonly rounds: number;
  private round = 1;
  private interactionsThisRound = 0;
  private totalInteractions = 0;
  private analytics: MotorPlanningAnalytics = {
    engagementTimeMs: 0,
    planningAttempts: 0,
    sequenceAttempts: 0,
    gameCompletion: 0,
    planningProgress: 0,
    helperCount: 0,
    lastUpdated: Date.now(),
  };

  constructor(gameId: MotorPlanningGameId, rounds = 3) {
    this.gameId = gameId;
    this.rounds = rounds;
  }

  get interactionsNeeded() {
    return 3;
  }

  startRound() {
    this.interactionsThisRound = 0;
  }

  recordAttempt(planningProgress: number) {
    this.interactionsThisRound += 1;
    this.totalInteractions += 1;
    this.analytics.planningAttempts += 1;
    this.analytics.sequenceAttempts += 1;
    this.analytics.planningProgress = Math.max(this.analytics.planningProgress, planningProgress);
    this.analytics.lastUpdated = Date.now();
  }

  markComplete() {
    this.analytics.gameCompletion += 1;
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

  accuracyPercent() {
    return Math.min(100, 55 + this.totalInteractions * 12);
  }

  getAnalytics() {
    return { ...this.analytics };
  }
}
