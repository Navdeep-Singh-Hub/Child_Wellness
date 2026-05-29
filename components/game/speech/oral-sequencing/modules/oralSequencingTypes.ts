export type OralSequencingState =
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

export type OralSequencingDifficulty = 'easy' | 'medium' | 'hard';

export type OralSequencingGameId =
  | 'magic-mouth-sequence'
  | 'funny-monster-steps'
  | 'robot-memory-mouth'
  | 'talking-rhythm-sequence'
  | 'sequence-hero-adventure';

export type OralSequencingRewardState = 'NONE' | 'SPARKLE' | 'STAR' | 'HERO';

export type OralSequencingSnapshot = {
  state: OralSequencingState;
  sequenceAttempt: number;
  coordinationAttempt: number;
  imitationAttempt: number;
  engagementLevel: number;
  rewardState: OralSequencingRewardState;
  coordinationPulse: boolean;
  helperVisible: boolean;
  engagementTimeMs: number;
  sequenceProgress: number;
  airflowActive: boolean;
  smoothedLevel: number;
  currentStepLabel: string;
};

export type OralSequencingAnalytics = {
  engagementTimeMs: number;
  sequenceAttempts: number;
  coordinationAttempts: number;
  gameCompletion: number;
  sequenceProgress: number;
  helperCount: number;
  lastUpdated: number;
};
