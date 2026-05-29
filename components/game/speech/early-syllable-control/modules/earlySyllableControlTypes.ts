export type EarlySyllableControlState =
  | 'IDLE'
  | 'SHOWING_PROMPT'
  | 'WAITING_FOR_ATTEMPT'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type EarlySyllable = 'ma' | 'pa' | 'ba' | 'moo' | 'bee' | 'aaa' | 'watch';

export type MouthPosture = 'OPEN' | 'CLOSED' | 'ROUNDED' | 'SPREAD' | 'UNKNOWN';

export type EarlySyllableRewardState = 'NONE' | 'SPARKLE' | 'STAR' | 'HERO';

export type EarlySyllableControlSnapshot = {
  state: EarlySyllableControlState;
  currentSyllable: EarlySyllable;
  syllableAttempt: number;
  vocalAttempt: number;
  sequenceProgress: number;
  engagementLevel: number;
  rewardState: EarlySyllableRewardState;
  rewardPulse: boolean;
  postureHint: MouthPosture | null;
  helperVisible: boolean;
  engagementTimeMs: number;
  syllableExposure: string[];
};

export type EarlySyllableDifficulty = 'easy' | 'medium' | 'hard';

export type EarlySyllableControlGameId =
  | 'syllable-pop-party'
  | 'talking-animal-syllables'
  | 'robot-speech-steps'
  | 'speech-train-builder'
  | 'little-speaker-hero';

export type EarlySyllableControlAnalytics = {
  engagementTimeMs: number;
  vocalAttempts: number;
  syllableAttempts: number;
  sequenceProgress: number;
  syllableExposure: string[];
  completedGames: number;
  helperCount: number;
  lastUpdated: number;
};
