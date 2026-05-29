/** Lip Alternation System — shared types (Level 5 Session 5). */

export type LipTransitionGameState =
  | 'IDLE'
  | 'DETECTING'
  | 'TRANSITIONING'
  | 'WARNING'
  | 'SUCCESS'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type LipTransitionGameId =
  | 'o-e-switch'
  | 'lip-talking-robot'
  | 'shape-rhythm'
  | 'lip-fast-mouth'
  | 'lip-dance';

export type { LipPose } from './PoseClassificationSystem';

export interface LipTransitionSnapshot {
  lipPose: import('./PoseClassificationSystem').LipPose;
  confirmedPose: boolean;
  poseHoldDuration: number;
  smoothedRound: number;
  smoothedSpread: number;
  confidence: number;
  unstable: boolean;
  inGracePeriod: boolean;
  lastTransition: { from: import('./PoseClassificationSystem').LipPose; to: import('./PoseClassificationSystem').LipPose; at: number } | null;
}

export interface LipTransitionAnalyticsRecord {
  transitionSuccessRate: number;
  averageTransitionSpeed: number;
  attemptCount: number;
  microBreaks: number;
  fatigueIndicators: number;
  lastUpdated: number;
}
