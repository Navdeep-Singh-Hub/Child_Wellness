export type TimingControlState =
  | 'IDLE'
  | 'SHOWING_PROMPT'
  | 'WAITING_FOR_ATTEMPT'
  | 'TIMING_ACTIVE'
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

export type TimingControlDifficulty = 'easy' | 'medium' | 'hard';

export type TimingControlGameId =
  | 'magic-mouth-beat'
  | 'funny-timing-monster'
  | 'robot-pause-go'
  | 'talking-rhythm-road'
  | 'timing-hero-challenge';

export type TimingRewardState = 'NONE' | 'SPARKLE' | 'STAR' | 'HERO';

export type TimingControlSnapshot = {
  state: TimingControlState;
  timingAttempt: number;
  coordinationAttempt: number;
  imitationAttempt: number;
  engagementLevel: number;
  rewardState: TimingRewardState;
  coordinationPulse: boolean;
  helperVisible: boolean;
  engagementTimeMs: number;
  timingProgress: number;
  airflowActive: boolean;
  smoothedLevel: number;
  currentStepLabel: string;
};

export type TimingControlAnalytics = {
  engagementTimeMs: number;
  timingAttempts: number;
  coordinationAttempts: number;
  gameCompletion: number;
  timingProgress: number;
  helperCount: number;
  lastUpdated: number;
};
