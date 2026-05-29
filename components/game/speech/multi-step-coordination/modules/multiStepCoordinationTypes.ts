export type MultiStepCoordinationState =
  | 'IDLE'
  | 'SHOWING_PROMPT'
  | 'WAITING_FOR_ATTEMPT'
  | 'SEQUENCE_ACTIVE'
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

export type MultiStepCoordinationDifficulty = 'easy' | 'medium' | 'hard';

export type MultiStepCoordinationGameId =
  | 'magic-mouth-steps'
  | 'funny-monster-combo-moves'
  | 'robot-mouth-builder-sequence'
  | 'talking-adventure-rhythm'
  | 'coordination-hero-quest';

export type MultiStepRewardState = 'NONE' | 'SPARKLE' | 'STAR' | 'HERO';

export type MultiStepCoordinationSnapshot = {
  state: MultiStepCoordinationState;
  coordinationAttempt: number;
  sequenceAttempt: number;
  imitationAttempt: number;
  engagementLevel: number;
  rewardState: MultiStepRewardState;
  coordinationPulse: boolean;
  helperVisible: boolean;
  engagementTimeMs: number;
  sequenceProgress: number;
  airflowActive: boolean;
  smoothedLevel: number;
  currentStepLabel: string;
};

export type MultiStepCoordinationAnalytics = {
  engagementTimeMs: number;
  sequenceAttempts: number;
  coordinationAttempts: number;
  gameCompletion: number;
  sequenceProgress: number;
  helperCount: number;
  lastUpdated: number;
};
