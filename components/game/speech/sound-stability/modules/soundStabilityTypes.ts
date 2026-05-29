export type SoundStabilityState =
  | 'IDLE'
  | 'LISTENING'
  | 'SOUND_ACTIVE'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type SoundStabilityDifficulty = 'easy' | 'medium' | 'hard';

export type SoundStabilityGameId =
  | 'magic-voice-river'
  | 'talking-balloon-hold'
  | 'robot-power-voice'
  | 'voice-train-journey'
  | 'speech-stability-hero';

export type SoundStabilitySnapshot = {
  state: SoundStabilityState;
  soundActive: boolean;
  stabilityPulse: boolean;
  intensity: number;
  sustainedDuration: number;
  vocalAttempt: number;
  stabilityAttempt: number;
  engagementLevel: number;
  rewardState: 'NONE' | 'SPARKLE' | 'STAR' | 'HERO';
  sustainGlow: number;
  smoothedLevel: number;
  calibrated: boolean;
};

export type SoundStabilityAnalytics = {
  vocalAttempts: number;
  sustainedDuration: number;
  stabilityAttempts: number;
  engagementTimeMs: number;
  averageSustainMs: number;
  completedGames: number;
  lastUpdated: number;
};
