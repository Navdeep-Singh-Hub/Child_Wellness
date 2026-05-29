export type FunctionalVocalIntentState =
  | 'IDLE'
  | 'LISTENING'
  | 'WAITING_FOR_RESPONSE'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type FunctionalVocalIntentDifficulty = 'easy' | 'medium' | 'hard';

export type FunctionalVocalIntentGameId =
  | 'magic-sound-request'
  | 'talking-friend-turn-taking'
  | 'voice-choice-adventure'
  | 'help-character-speak'
  | 'little-communicator-hero';

export type FunctionalVocalIntentSnapshot = {
  state: FunctionalVocalIntentState;
  responseDetected: boolean;
  responsePulse: boolean;
  intensity: number;
  duration: number;
  vocalAttempt: number;
  interactionAttempt: number;
  communicationIntent: number;
  engagementLevel: number;
  rewardState: 'NONE' | 'SPARKLE' | 'STAR' | 'HERO';
  smoothedLevel: number;
  calibrated: boolean;
};

export type FunctionalVocalIntentAnalytics = {
  vocalAttempts: number;
  interactionAttempts: number;
  engagementTimeMs: number;
  averageDuration: number;
  averageIntensity: number;
  completedGames: number;
  lastUpdated: number;
};
