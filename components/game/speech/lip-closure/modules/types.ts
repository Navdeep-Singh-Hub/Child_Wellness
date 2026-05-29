/** Lip Closure System — shared types (Level 5 Session 1). */

export type LipGameState =
  | 'IDLE'
  | 'DETECTING'
  | 'SUCCESS'
  | 'HELPING'
  | 'REWARDING'
  | 'PAUSED';

export type LipDifficulty = 'easy' | 'medium' | 'hard';

export type LipGameId =
  | 'bubble-seal'
  | 'sleeping-fish'
  | 'cookie-hold'
  | 'lip-closure-freeze'
  | 'lip-lock-door';

export interface LipDetectionSnapshot {
  lipsClosed: boolean;
  holdDuration: number;
  confidence: number;
  smoothedGap: number;
  unstable: boolean;
}

export interface LipAnalyticsRecord {
  averageHoldTime: number;
  successfulClosures: number;
  attemptCount: number;
  fatigueSignals: number;
  lastUpdated: number;
}

export interface LipHoldConfig {
  targetMs: number;
  shrinkRate?: number;
  growRate?: number;
}
