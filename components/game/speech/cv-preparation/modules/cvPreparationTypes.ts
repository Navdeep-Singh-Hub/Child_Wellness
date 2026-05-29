export type CVPreparationState =
  | 'IDLE'
  | 'SHOWING_PROMPT'
  | 'WAITING_FOR_ATTEMPT'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type CVPattern = 'ma' | 'pa' | 'ba' | 'moo' | 'bee' | 'watch';

export type MouthPosture = 'OPEN' | 'CLOSED' | 'ROUNDED' | 'SPREAD' | 'UNKNOWN';

export type CVPreparationRewardState = 'NONE' | 'SPARKLE' | 'STAR' | 'HERO';

export type CVPreparationSnapshot = {
  state: CVPreparationState;
  currentPattern: CVPattern;
  mouthApproximation: number;
  vocalAttempt: number;
  imitationAttempts: number;
  sequenceProgress: number;
  engagementLevel: number;
  rewardState: CVPreparationRewardState;
  rewardPulse: boolean;
  postureHint: MouthPosture | null;
  helperVisible: boolean;
  engagementTimeMs: number;
  patternExposure: string[];
};

export type CVPreparationDifficulty = 'easy' | 'medium' | 'hard';

export type CVPreparationGameId =
  | 'magic-sound-builder'
  | 'talking-animal-mouths'
  | 'robot-says-play'
  | 'speech-pattern-train'
  | 'mini-talking-hero';

export type CVPreparationAnalytics = {
  engagementTimeMs: number;
  vocalAttempts: number;
  imitationAttempts: number;
  sequenceProgress: number;
  patternExposure: string[];
  completedGames: number;
  helperCount: number;
  lastUpdated: number;
};
