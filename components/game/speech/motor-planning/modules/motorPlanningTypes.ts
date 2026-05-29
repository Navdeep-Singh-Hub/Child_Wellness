export type MotorPlanningState =
  | 'IDLE'
  | 'SHOWING_SEQUENCE'
  | 'PREPARE_PHASE'
  | 'WAITING_FOR_ATTEMPT'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type OralApproximation =
  | 'OPEN'
  | 'CLOSED'
  | 'ROUNDED'
  | 'SPREAD'
  | 'PARTIAL_OPEN'
  | 'TONGUE_VISIBLE_APPROX';

export type MotorPlanningDifficulty = 'easy' | 'medium' | 'hard';

export type MotorPlanningGameId =
  | 'magic-mouth-planner'
  | 'funny-monster-mission'
  | 'robot-copy-challenge'
  | 'talking-path-adventure'
  | 'motor-planning-hero';

export type MotorPlanningRewardState = 'NONE' | 'SPARKLE' | 'STAR' | 'HERO';

export type MotorPlanningSnapshot = {
  state: MotorPlanningState;
  planningAttempt: number;
  sequenceAttempt: number;
  imitationAttempt: number;
  engagementLevel: number;
  rewardState: MotorPlanningRewardState;
  coordinationPulse: boolean;
  helperVisible: boolean;
  engagementTimeMs: number;
  planningProgress: number;
  airflowActive: boolean;
  smoothedLevel: number;
  currentStepLabel: string;
};

export type MotorPlanningAnalytics = {
  engagementTimeMs: number;
  planningAttempts: number;
  sequenceAttempts: number;
  gameCompletion: number;
  planningProgress: number;
  helperCount: number;
  lastUpdated: number;
};
