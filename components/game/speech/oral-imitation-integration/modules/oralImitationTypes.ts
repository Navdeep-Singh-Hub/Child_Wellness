export type OralImitationState =
  | 'IDLE'
  | 'SHOWING_PROMPT'
  | 'WAITING_FOR_INTERACTION'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type OralImitationRewardState = 'NONE' | 'SPARKLE' | 'STAR' | 'HERO';

export type OralImitationPrompt =
  | 'open'
  | 'close'
  | 'smile'
  | 'funny-lips'
  | 'tongue-out'
  | 'blow'
  | 'watch'
  | 'tap';

export type OralImitationSnapshot = {
  state: OralImitationState;
  gameProgress: number;
  interactionCount: number;
  engagementLevel: number;
  imitationAttempts: number;
  rewardState: OralImitationRewardState;
  rewardPulse: boolean;
  prompt: OralImitationPrompt;
  helperVisible: boolean;
  engagementTimeMs: number;
};

export type OralImitationDifficulty = 'easy' | 'medium' | 'hard';

export type OralImitationGameId =
  | 'copy-my-mouth-friend'
  | 'funny-mouth-adventure'
  | 'air-mouth-play'
  | 'oral-mirror-party'
  | 'mouth-hero-adventure';

export type OralImitationAnalytics = {
  engagementTimeMs: number;
  interactionCount: number;
  imitationAttempts: number;
  completedGames: number;
  helperCount: number;
  lastUpdated: number;
};
