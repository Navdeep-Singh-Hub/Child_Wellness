export type BreathLipCoordinationState =
  | 'IDLE'
  | 'SHOWING_PROMPT'
  | 'WAITING_FOR_ATTEMPT'
  | 'AIRFLOW_ACTIVE'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type LipApproximation =
  | 'OPEN'
  | 'CLOSED'
  | 'ROUNDED'
  | 'SPREAD'
  | 'PARTIAL_OPEN';

export type BreathLipCoordinationDifficulty = 'easy' | 'medium' | 'hard';

export type BreathLipCoordinationGameId =
  | 'magic-wind-lips'
  | 'funny-balloon-breaths'
  | 'robot-wind-mouth'
  | 'wind-rhythm-adventure'
  | 'breath-lips-hero';

export type BreathLipRewardState = 'NONE' | 'SPARKLE' | 'STAR' | 'HERO';

export type BreathLipCoordinationSnapshot = {
  state: BreathLipCoordinationState;
  airflowAttempt: number;
  coordinationAttempt: number;
  lipApproximation: LipApproximation;
  engagementLevel: number;
  rewardState: BreathLipRewardState;
  coordinationPulse: boolean;
  helperVisible: boolean;
  engagementTimeMs: number;
  airflowActive: boolean;
  smoothedLevel: number;
  lipHint: string;
  airHint: string;
};

export type BreathLipCoordinationAnalytics = {
  engagementTimeMs: number;
  airflowAttempts: number;
  coordinationAttempts: number;
  gameCompletion: number;
  sequenceProgress: number;
  helperCount: number;
  lastUpdated: number;
};
