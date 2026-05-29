/** Functional Lip Sequencing System — shared types (Level 5 Session 10). */

import type { ResistancePose } from './ResistancePoseSystem';

export type FunctionalSequenceGameState =
  | 'IDLE'
  | 'DETECTING'
  | 'SEQUENCING'
  | 'WAITING_FOR_STEP'
  | 'SUCCESS'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type FunctionalStepType = ResistancePose | 'BURST' | 'AIRFLOW';

export interface FunctionalSequenceStep {
  state: FunctionalStepType;
  hold: number;
}

export type FunctionalSequenceGameId =
  | 'lip-talking-path'
  | 'lip-sound-builder'
  | 'lip-mouth-adventure'
  | 'lip-smooth-switch'
  | 'lip-speech-prep-master';

export interface FunctionalSequenceSnapshot {
  lipPose: ResistancePose;
  poseHoldMs: number;
  poseConfirmed: boolean;
  lipsClosed: boolean;
  audioLevel: number;
  audioSpike: boolean;
  airflowActive: boolean;
  airflowStrength: number;
  sequenceProgress: number;
  currentStep: FunctionalSequenceStep | null;
  state: FunctionalSequenceGameState;
  confidence: number;
  unstable: boolean;
  inGracePeriod: boolean;
  helpfulHint: string;
  transitionSmoothness: number;
}

export interface FunctionalSequenceAnalyticsRecord {
  sequenceCompletionRate: number;
  transitionSmoothness: number;
  attemptCount: number;
  fatigueIndicators: number;
  holdPerformance: number;
  coordinationScore: number;
  lastUpdated: number;
}
