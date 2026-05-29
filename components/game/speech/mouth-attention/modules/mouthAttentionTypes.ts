export type MouthAttentionState =
  | 'IDLE'
  | 'SHOWING_PROMPT'
  | 'WAITING_FOR_INTERACTION'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type MouthAttentionRewardState = 'NONE' | 'SPARKLE' | 'STAR' | 'TREASURE';

export type MouthAttentionTarget = 'lips' | 'tongue' | 'jaw' | 'mouth' | 'cheek';

export type MouthAttentionSnapshot = {
  state: MouthAttentionState;
  gameProgress: number;
  interactionCount: number;
  engagementLevel: number;
  attentionShiftCount: number;
  rewardState: MouthAttentionRewardState;
  rewardPulse: boolean;
  promptTarget: MouthAttentionTarget;
  helperVisible: boolean;
  engagementTimeMs: number;
};

export type MouthAttentionDifficulty = 'easy' | 'medium' | 'hard';

export type MouthAttentionGameId =
  | 'find-mouth-part'
  | 'magic-mouth-spotlight'
  | 'follow-funny-mouth'
  | 'where-did-it-go-mouth'
  | 'mouth-treasure-hunt';

export type MouthAttentionAnalytics = {
  engagementTimeMs: number;
  interactionCount: number;
  attentionShiftCount: number;
  completedGames: number;
  helperCount: number;
  lastUpdated: number;
};

