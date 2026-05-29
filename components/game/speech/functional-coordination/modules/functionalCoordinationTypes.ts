export type FunctionalCoordinationState =
  | 'IDLE'
  | 'SHOWING_SEQUENCE'
  | 'PREPARE_PHASE'
  | 'WAITING_FOR_ATTEMPT'
  | 'COORDINATION_ACTIVE'
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

export type FunctionalCoordinationDifficulty = 'easy' | 'medium' | 'hard';

export type FunctionalCoordinationGameId =
  | 'magic-mouth-teamwork'
  | 'funny-talking-monster'
  | 'robot-mouth-adventure'
  | 'talking-rhythm-quest'
  | 'coordination-hero-graduation';

export type FunctionalRewardState = 'NONE' | 'SPARKLE' | 'STAR' | 'HERO';

export type FunctionalCoordinationSnapshot = {
  state: FunctionalCoordinationState;
  coordinationAttempt: number;
  planningAttempt: number;
  sequenceAttempt: number;
  engagementLevel: number;
  rewardState: FunctionalRewardState;
  coordinationPulse: boolean;
  helperVisible: boolean;
  engagementTimeMs: number;
  coordinationProgress: number;
  airflowActive: boolean;
  smoothedLevel: number;
  currentStepLabel: string;
};

export type FunctionalCoordinationAnalytics = {
  engagementTimeMs: number;
  coordinationAttempts: number;
  sequenceAttempts: number;
  gameCompletion: number;
  coordinationProgress: number;
  helperCount: number;
  lastUpdated: number;
};
