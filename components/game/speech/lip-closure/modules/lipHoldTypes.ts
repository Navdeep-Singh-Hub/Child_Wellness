/** Lip Hold System — shared types (Level 5 Session 2). */

export type LipHoldGameState =
  | 'IDLE'
  | 'DETECTING'
  | 'STABLE'
  | 'WARNING'
  | 'SUCCESS'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type LipHoldDifficulty = 'easy' | 'medium' | 'hard';

export type LipHoldGameId =
  | 'hold-balloon'
  | 'magic-seal'
  | 'freeze-smile'
  | 'quiet-mouse'
  | 'lip-statue';

export interface LipGeometry {
  mouthWidth: number;
  mouthHeight: number;
}

export interface LipStabilitySnapshot {
  stableHold: boolean;
  stabilityScore: number;
  holdDuration: number;
  confidence: number;
  smoothedMovement: number;
  unstable: boolean;
  inGracePeriod: boolean;
}

export interface LipHoldAnalyticsRecord {
  averageStability: number;
  holdDuration: number;
  microBreaks: number;
  attemptCount: number;
  fatigueIndicators: number;
  lastUpdated: number;
}
