import type {
  MotorSpeechTimingAnalytics,
  MotorSpeechTimingDifficulty,
  MotorSpeechTimingGameId,
} from './motorSpeechTimingTypes';

export function motorSpeechTimingRoundDifficulty(round: number): MotorSpeechTimingDifficulty {
  if (round <= 1) return 'easy';
  if (round === 2) return 'medium';
  return 'hard';
}

export class MotorSpeechTimingSessionManager {
  readonly gameId: MotorSpeechTimingGameId;
  readonly rounds: number;
  private round = 1;
  private interactionsThisRound = 0;
  private totalRhythmAttempts = 0;
  private analytics: MotorSpeechTimingAnalytics = {
    engagementTimeMs: 0,
    vocalAttempts: 0,
    rhythmAttempts: 0,
    sequenceProgress: 0,
    rhythmExposure: [],
    completedGames: 0,
    helperCount: 0,
    lastUpdated: Date.now(),
  };

  constructor(gameId: MotorSpeechTimingGameId, rounds = 3) {
    this.gameId = gameId;
    this.rounds = rounds;
  }

  get interactionsNeeded() {
    return 3;
  }

  startRound() {
    this.interactionsThisRound = 0;
  }

  recordRhythmAttempt(rhythmExposure: string[], vocal = false, sequenceProgress = 0) {
    this.interactionsThisRound += 1;
    this.totalRhythmAttempts += 1;
    this.analytics.rhythmAttempts = this.totalRhythmAttempts;
    if (vocal) this.analytics.vocalAttempts += 1;
    this.analytics.sequenceProgress = Math.max(this.analytics.sequenceProgress, sequenceProgress);
    for (const r of rhythmExposure) {
      if (!this.analytics.rhythmExposure.includes(r)) {
        this.analytics.rhythmExposure = [...this.analytics.rhythmExposure, r];
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
    const exp = this.analytics.rhythmExposure.length;
    return Math.min(100, 50 + this.totalRhythmAttempts * 10 + exp * 5);
  }
}
