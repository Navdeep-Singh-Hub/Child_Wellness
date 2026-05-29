export type SpeechOralImitationState =
  | 'IDLE'
  | 'SHOWING_PROMPT'
  | 'WAITING_FOR_IMITATION'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type SpeechOralImitationRewardState = 'NONE' | 'SPARKLE' | 'STAR' | 'HERO';

export type SpeechMouthShape =
  | 'open'
  | 'closed'
  | 'round'
  | 'smile'
  | 'ooo'
  | 'eee'
  | 'spread'
  | 'watch';

export type ApproximatePosture = 'OPEN' | 'CLOSED' | 'ROUNDED' | 'SPREAD' | 'UNKNOWN';

export type SpeechOralImitationSnapshot = {
  state: SpeechOralImitationState;
  gameProgress: number;
  interactionCount: number;
  imitationAttempts: number;
  engagementLevel: number;
  sequenceProgress: number;
  sequenceStep: number;
  rewardState: SpeechOralImitationRewardState;
  rewardPulse: boolean;
  promptShape: SpeechMouthShape;
  helperVisible: boolean;
  engagementTimeMs: number;
  encouragementPosture: ApproximatePosture | null;
};

export type SpeechOralImitationDifficulty = 'easy' | 'medium' | 'hard';

export type SpeechOralImitationGameId =
  | 'speech-mouth-copy'
  | 'talking-robot-face'
  | 'mouth-pattern-match'
  | 'mirror-speech-play'
  | 'speech-hero-warmup';

export type SpeechOralImitationAnalytics = {
  engagementTimeMs: number;
  interactionCount: number;
  imitationAttempts: number;
  sequenceProgress: number;
  completedGames: number;
  helperCount: number;
  lastUpdated: number;
};
