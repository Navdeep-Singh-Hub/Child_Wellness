/** Lip Rounding System — shared types (Level 5 Session 3). */

export type LipRoundGameState =
  | 'IDLE'
  | 'DETECTING'
  | 'ROUNDED'
  | 'WARNING'
  | 'SUCCESS'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type LipRoundDifficulty = 'easy' | 'medium' | 'hard';

export type LipRoundGameId =
  | 'lip-fish-mouth'
  | 'tunnel-air'
  | 'round-portal'
  | 'bubble-cannon'
  | 'moon-mouth';

export interface LipRoundSnapshot {
  roundedLips: boolean;
  confirmedRounded: boolean;
  roundnessScore: number;
  smoothedRatio: number;
  holdDuration: number;
  confidence: number;
  unstable: boolean;
  inGracePeriod: boolean;
}

export interface LipRoundAnalyticsRecord {
  averageRoundness: number;
  holdDuration: number;
  attemptCount: number;
  microBreaks: number;
  fatigueIndicators: number;
  lastUpdated: number;
}
