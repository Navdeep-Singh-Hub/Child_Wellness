export type BreathJawCoordinationState =
  | 'IDLE'
  | 'SHOWING_PROMPT'
  | 'WAITING_FOR_ATTEMPT'
  | 'AIRFLOW_ACTIVE'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type JawApproximation = 'OPEN' | 'PARTIAL_OPEN' | 'CLOSED';

export type BreathJawCoordinationDifficulty = 'easy' | 'medium' | 'hard';

export type BreathJawCoordinationGameId =
  | 'magic-wind-mouth'
  | 'funny-dragon-breaths'
  | 'robot-air-mouth-switch'
  | 'breathing-train-rhythm'
  | 'breath-jaw-hero';

export type BreathJawRewardState = 'NONE' | 'SPARKLE' | 'STAR' | 'HERO';

export type BreathJawCoordinationSnapshot = {
  state: BreathJawCoordinationState;
  airflowAttempt: number;
  coordinationAttempt: number;
  jawApproximation: JawApproximation;
  engagementLevel: number;
  rewardState: BreathJawRewardState;
  coordinationPulse: boolean;
  helperVisible: boolean;
  engagementTimeMs: number;
  airflowActive: boolean;
  smoothedLevel: number;
  jawHint: string;
  airHint: string;
};

export type BreathJawCoordinationAnalytics = {
  engagementTimeMs: number;
  airflowAttempts: number;
  coordinationAttempts: number;
  gameCompletion: number;
  sequenceProgress: number;
  helperCount: number;
  lastUpdated: number;
};
