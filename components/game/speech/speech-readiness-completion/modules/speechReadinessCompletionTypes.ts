export type SpeechReadinessCompletionState =
  | 'IDLE'
  | 'SHOWING_PROMPT'
  | 'WAITING_FOR_ATTEMPT'
  | 'LISTENING'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type SpeechReadinessCompletionDifficulty = 'easy' | 'medium' | 'hard';

export type SpeechReadinessCompletionGameId =
  | 'speech-adventure-party'
  | 'talking-friend-challenge'
  | 'magic-mouth-mission'
  | 'little-speaker-celebration'
  | 'speech-hero-graduation';

export type ParticipationType = 'vocal' | 'imitation';

export type SpeechReadinessCompletionSnapshot = {
  state: SpeechReadinessCompletionState;
  responseDetected: boolean;
  participationPulse: boolean;
  participationType: ParticipationType | null;
  intensity: number;
  duration: number;
  vocalAttempt: number;
  imitationAttempt: number;
  participationLevel: number;
  sequenceProgress: number;
  engagementLevel: number;
  rewardState: 'NONE' | 'SPARKLE' | 'STAR' | 'GRADUATION';
  smoothedLevel: number;
  calibrated: boolean;
};

export type SpeechReadinessCompletionAnalytics = {
  vocalAttempts: number;
  imitationAttempts: number;
  engagementTimeMs: number;
  participationLevel: number;
  averageDuration: number;
  averageIntensity: number;
  completedGames: number;
  lastUpdated: number;
};
