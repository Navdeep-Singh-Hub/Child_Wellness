/** Lip Airflow Control System — shared types (Level 5 Session 8). */

import type { ResistancePose } from './ResistancePoseSystem';

export type LipAirflowGameState =
  | 'IDLE'
  | 'WAITING_FOR_LIP_POSTURE'
  | 'WAITING_FOR_AIRFLOW'
  | 'COORDINATING'
  | 'SUCCESS'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type LipAirflowGameId =
  | 'lip-feather-float'
  | 'lip-candle-control'
  | 'lip-bubble-stream'
  | 'lip-wind-tunnel'
  | 'lip-breath-painter';

export type RequiredAirflowPose = 'ROUNDED' | 'ANY';

export interface AirflowSample {
  airflowStrength: number;
  airflowStability: number;
  airflowDuration: number;
  airflowActive: boolean;
  isShout: boolean;
}

export interface LipAirflowSnapshot {
  lipPose: ResistancePose;
  mouthWidth: number;
  mouthHeight: number;
  airflowStrength: number;
  airflowStability: number;
  airflowDuration: number;
  airflowActive: boolean;
  isShout: boolean;
  coordinationScore: number;
  accumulatedMs: number;
  state: LipAirflowGameState;
  confidence: number;
  unstable: boolean;
  helpfulHint: string;
}

export interface LipAirflowAnalyticsRecord {
  airflowDuration: number;
  averageAirflowStrength: number;
  stabilityScore: number;
  attemptCount: number;
  fatigueIndicators: number;
  lastUpdated: number;
}
