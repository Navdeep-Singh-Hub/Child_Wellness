export type BilabialSequencingState =
  | 'IDLE'
  | 'SHOWING_PROMPT'
  | 'WAITING_FOR_ATTEMPT'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type BilabialRepeat = 'ma_ma' | 'pa_pa' | 'ba_ba' | 'mmm' | 'watch';

export type MouthPosture = 'CLOSED' | 'OPEN' | 'ROUNDED' | 'SPREAD' | 'UNKNOWN';

export type BilabialSequencingRewardState = 'NONE' | 'SPARKLE' | 'STAR' | 'HERO';

export type BilabialSequencingSnapshot = {
  state: BilabialSequencingState;
  currentRepeat: BilabialRepeat;
  mouthApproximation: number;
  vocalAttempt: number;
  repetitionAttempt: number;
  sequenceProgress: number;
  engagementLevel: number;
  rewardState: BilabialSequencingRewardState;
  rewardPulse: boolean;
  postureHint: MouthPosture | null;
  helperVisible: boolean;
  engagementTimeMs: number;
  repeatExposure: string[];
};

export type BilabialSequencingDifficulty = 'easy' | 'medium' | 'hard';

export type BilabialSequencingGameId =
  | 'mama-drum-beat'
  | 'pop-balloon-race'
  | 'talking-robot-beats'
  | 'speech-train-rhythm'
  | 'mini-speaker-hero';

export type BilabialSequencingAnalytics = {
  engagementTimeMs: number;
  vocalAttempts: number;
  repetitionAttempts: number;
  sequenceProgress: number;
  repeatExposure: string[];
  completedGames: number;
  helperCount: number;
  lastUpdated: number;
};
