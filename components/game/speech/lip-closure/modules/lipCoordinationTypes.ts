/** Lip Coordination System — shared types (Level 5 Session 9). */

import type { ResistancePose } from './ResistancePoseSystem';

export type LipCoordinationGameState =
  | 'IDLE'
  | 'DETECTING'
  | 'COORDINATING'
  | 'WAITING_FOR_BEAT'
  | 'SUCCESS'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type LipCoordinationGameId =
  | 'lip-rhythm-mouth'
  | 'lip-copy-avatar'
  | 'lip-mouth-memory'
  | 'lip-beat-builder'
  | 'lip-orchestra';

export type CoordinationPose = ResistancePose;

export type RhythmDifficulty = 'easy' | 'medium' | 'hard';

export interface LipCoordinationSnapshot {
  lipPose: CoordinationPose;
  poseHoldMs: number;
  poseConfirmed: boolean;
  coordinationScore: number;
  sequenceProgress: number;
  state: LipCoordinationGameState;
  confidence: number;
  unstable: boolean;
  inGracePeriod: boolean;
  helpfulHint: string;
  beatPulse: boolean;
  beatActive: boolean;
  pulsePhase: number;
}

export interface LipCoordinationAnalyticsRecord {
  coordinationScore: number;
  timingAccuracy: number;
  sequenceCompletionRate: number;
  attemptCount: number;
  fatigueIndicators: number;
  lastUpdated: number;
}
