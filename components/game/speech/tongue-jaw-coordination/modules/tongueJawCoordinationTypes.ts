export type TongueJawCoordinationState =
  | 'IDLE'
  | 'SHOWING_PROMPT'
  | 'WAITING_FOR_ATTEMPT'
  | 'COORDINATION_ACTIVE'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type TongueApproximation = 'NONE' | 'TONGUE_OUT_APPROX' | 'TONGUE_VISIBLE_APPROX';

export type TongueJawCoordinationDifficulty = 'easy' | 'medium' | 'hard';

export type TongueJawCoordinationGameId =
  | 'tongue-explorer-teamwork'
  | 'funny-monster-tongue-moves'
  | 'magic-mouth-tunnel'
  | 'talking-tongue-rhythm'
  | 'tongue-coordination-hero';

export type TongueJawRewardState = 'NONE' | 'SPARKLE' | 'STAR' | 'HERO';

export type TongueJawCoordinationSnapshot = {
  state: TongueJawCoordinationState;
  tongueApproximation: TongueApproximation;
  coordinationAttempt: number;
  imitationAttempt: number;
  sequenceProgress: number;
  engagementLevel: number;
  rewardState: TongueJawRewardState;
  coordinationPulse: boolean;
  helperVisible: boolean;
  engagementTimeMs: number;
  tongueHint: string;
  jawHint: string;
};

export type TongueJawCoordinationAnalytics = {
  engagementTimeMs: number;
  coordinationAttempts: number;
  imitationAttempts: number;
  sequenceProgress: number;
  completedGames: number;
  helperCount: number;
  lastUpdated: number;
};

