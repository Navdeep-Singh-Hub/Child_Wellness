/** Level 5 Session 1 — Air Awareness & Airflow Cause-Effect */

export type BreathGameState =
  | 'IDLE'
  | 'LISTENING'
  | 'BREATH_DETECTED'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type BreathDifficulty = 'easy' | 'medium' | 'hard';

export type BreathGameId =
  | 'magic-feather'
  | 'cloud-puff'
  | 'bubble-wakeup'
  | 'windmill-friend'
  | 'air-painter';

export interface BreathSnapshot {
  breathDetected: boolean;
  /** True for one poll tick when a new breath attempt starts */
  breathPulse: boolean;
  intensity: number;
  duration: number;
  confidence: number;
  state: BreathGameState;
  smoothedLevel: number;
  calibrated: boolean;
}

export interface BreathAnalyticsRecord {
  breathAttempts: number;
  engagementTimeMs: number;
  interactionSuccess: number;
  averageIntensity: number;
  lastUpdated: number;
}
