/** Level 5 Session 3 — Breath Activation & Start–Stop Air */

export type BreathActivationState =
  | 'IDLE'
  | 'LISTENING'
  | 'BREATH_ACTIVE'
  | 'BREATH_STOPPED'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type BreathActivationDifficulty = 'easy' | 'medium' | 'hard';

export type BreathActivationGameId =
  | 'wake-feather'
  | 'start-stop-cloud'
  | 'windmill-freeze'
  | 'balloon-breath'
  | 'magic-air-switch';

export interface BreathActivationSnapshot {
  breathActive: boolean;
  breathStopped: boolean;
  breathStarted: boolean;
  cyclePulse: boolean;
  intensity: number;
  duration: number;
  confidence: number;
  state: BreathActivationState;
  smoothedLevel: number;
  calibrated: boolean;
}

export interface BreathActivationAnalyticsRecord {
  breathAttempts: number;
  engagementTimeMs: number;
  interactionSuccess: number;
  averageDuration: number;
  lastUpdated: number;
}
