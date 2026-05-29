import { LipAirflowCoordinator } from './LipAirflowCoordinator';
import { saveLipAirflowAnalytics } from './lipAirflowAnalytics';
import { RewardManager } from './RewardManager';
import type { LipAirflowGameId, LipAirflowGameState, RequiredAirflowPose } from './lipAirflowTypes';

/** Session game manager (spec: Session38GameManager). */
export class LipAirflowSessionManager {
  readonly coordinator = new LipAirflowCoordinator();
  readonly rewards = new RewardManager();

  constructor(
    readonly gameId: LipAirflowGameId,
    readonly rounds = 3,
  ) {}

  get state(): LipAirflowGameState {
    return this.coordinator.state;
  }

  startRound(requiredPose: RequiredAirflowPose, targetMs: number) {
    this.coordinator.startSession(requiredPose, targetMs);
    this.rewards.onAttempt();
  }

  async recordSuccess(durationMs: number, strength: number, stability: number) {
    this.rewards.onSuccess(durationMs);
    await saveLipAirflowAnalytics(this.gameId, {
      airflowDuration: durationMs,
      averageAirflowStrength: strength,
      stabilityScore: stability,
      attemptCount: this.coordinator.attemptCount,
      fatigueIndicators: this.coordinator.fatigueIndicators,
    });
  }

  resetRound() {
    this.coordinator.reset();
    this.rewards.reset();
  }
}

export function airflowRoundTargetMs(round: number, baseMs: number) {
  const extra = Math.min(4000, (round - 1) * 800);
  return Math.min(8000, baseMs + extra);
}
