/** Lip Resistance System — shared types (Level 5 Session 6). */

export type LipResistanceGameState =
  | 'IDLE'
  | 'DETECTING'
  | 'HOLDING'
  | 'WARNING'
  | 'SUCCESS'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type LipResistanceDifficulty = 'easy' | 'medium' | 'hard';

export type LipResistanceGameId =
  | 'hold-wall'
  | 'lip-push-battle'
  | 'wind-resistance'
  | 'lip-resistance-freeze'
  | 'strong-mouth-hero';

export type { ResistancePose } from './ResistancePoseSystem';

export interface LipResistanceSnapshot {
  lipPose: import('./ResistancePoseSystem').ResistancePose;
  stableHold: boolean;
  stabilityScore: number;
  holdDuration: number;
  resistanceScore: number;
  confidence: number;
  unstable: boolean;
  inGracePeriod: boolean;
  microBreaks: number;
}

export interface LipResistanceAnalyticsRecord {
  averageHoldTime: number;
  stabilityScore: number;
  attemptCount: number;
  microBreaks: number;
  fatigueIndicators: number;
  lastUpdated: number;
}
