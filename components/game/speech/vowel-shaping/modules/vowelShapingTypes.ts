export type VowelShapingState =
  | 'IDLE'
  | 'SHOWING_PROMPT'
  | 'WAITING_FOR_IMITATION'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type VowelShape = 'aaa' | 'ooo' | 'eee' | 'watch';

export type PostureClass = 'OPEN' | 'ROUNDED' | 'SPREAD' | 'UNKNOWN';

export type VowelShapingRewardState = 'NONE' | 'SPARKLE' | 'STAR' | 'HERO';

export type VowelShapingSnapshot = {
  state: VowelShapingState;
  vowelShapeDetected: VowelShape;
  approximationLevel: number;
  vocalAttempt: number;
  imitationAttempts: number;
  engagementLevel: number;
  rewardState: VowelShapingRewardState;
  rewardPulse: boolean;
  postureHint: PostureClass | null;
  helperVisible: boolean;
  engagementTimeMs: number;
  vowelExposure: string[];
};

export type VowelShapingDifficulty = 'easy' | 'medium' | 'hard';

export type VowelShapingGameId =
  | 'magic-mouth-shapes'
  | 'talking-animal-vowels'
  | 'mirror-vowel-face'
  | 'vowel-balloon-builder'
  | 'speech-shape-adventure';

export type VowelShapingAnalytics = {
  engagementTimeMs: number;
  imitationAttempts: number;
  vocalAttempts: number;
  vowelExposure: string[];
  completedGames: number;
  helperCount: number;
  lastUpdated: number;
};
