export type TongueAwarenessState =
  | 'IDLE'
  | 'SHOWING_PROMPT'
  | 'WAITING_FOR_INTERACTION'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type TongueAwarenessRewardState = 'NONE' | 'SPARKLE' | 'GIGGLE' | 'TREASURE';

export type TongueExplorationState =
  | 'intro'
  | 'peek'
  | 'mirror'
  | 'play'
  | 'adventure'
  | 'mapping';

export type TongueAwarenessZone = 'tongue' | 'inside' | 'lips' | 'roof' | 'floor' | 'mouth';

export type TongueAwarenessSnapshot = {
  state: TongueAwarenessState;
  gameProgress: number;
  interactionCount: number;
  engagementLevel: number;
  explorationState: TongueExplorationState;
  rewardState: TongueAwarenessRewardState;
  rewardPulse: boolean;
  promptZone: TongueAwarenessZone;
  helperVisible: boolean;
  engagementTimeMs: number;
};

export type TongueAwarenessDifficulty = 'easy' | 'medium' | 'hard';

export type TongueAwarenessGameId =
  | 'friendly-tongue-explorer'
  | 'tongue-hide-seek'
  | 'magic-tongue-mirror'
  | 'hungry-tongue-monster'
  | 'tongue-treasure-adventure';

export type TongueAwarenessAnalytics = {
  engagementTimeMs: number;
  interactionCount: number;
  explorationPatterns: string[];
  completedGames: number;
  helperCount: number;
  lastUpdated: number;
};
