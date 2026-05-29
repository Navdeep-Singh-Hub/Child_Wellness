export type LipJawCoordinationState =
  | 'IDLE'
  | 'SHOWING_PROMPT'
  | 'WAITING_FOR_ATTEMPT'
  | 'COORDINATION_ACTIVE'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type MouthState = 'OPEN' | 'CLOSED' | 'ROUNDED' | 'SPREAD' | 'PARTIAL_OPEN';

export type LipJawCoordinationDifficulty = 'easy' | 'medium' | 'hard';

export type LipJawCoordinationGameId =
  | 'funny-mouth-teamwork'
  | 'robot-mouth-builder'
  | 'magic-mouth-switch'
  | 'talking-face-rhythm'
  | 'mouth-coordination-hero';

export type LipJawRewardState = 'NONE' | 'SPARKLE' | 'STAR' | 'HERO';

export type LipJawCoordinationSnapshot = {
  state: LipJawCoordinationState;
  mouthState: MouthState;
  coordinationAttempt: number;
  imitationAttempt: number;
  sequenceProgress: number;
  engagementLevel: number;
  rewardState: LipJawRewardState;
  coordinationPulse: boolean;
  helperVisible: boolean;
  engagementTimeMs: number;
  lipHint: string;
  jawHint: string;
};

export type LipJawCoordinationAnalytics = {
  engagementTimeMs: number;
  coordinationAttempts: number;
  imitationAttempts: number;
  sequenceProgress: number;
  completedGames: number;
  helperCount: number;
  lastUpdated: number;
};
