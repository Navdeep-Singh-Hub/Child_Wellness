export type SoundInitiationState =
  | 'IDLE'
  | 'LISTENING'
  | 'SOUND_DETECTED'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type SoundInitiationDifficulty = 'easy' | 'medium' | 'hard';

export type SoundInitiationGameId =
  | 'wake-sleeping-star'
  | 'talking-robot-start'
  | 'magic-voice-balloon'
  | 'funny-voice-echo'
  | 'sound-hero-starter';

export type SoundInitiationSnapshot = {
  state: SoundInitiationState;
  soundDetected: boolean;
  soundPulse: boolean;
  intensity: number;
  duration: number;
  confidence: number;
  vocalAttempt: number;
  smoothedLevel: number;
  calibrated: boolean;
};

export type SoundInitiationAnalytics = {
  soundAttempts: number;
  engagementTimeMs: number;
  interactionCount: number;
  averageDuration: number;
  averageIntensity: number;
  lastUpdated: number;
};
