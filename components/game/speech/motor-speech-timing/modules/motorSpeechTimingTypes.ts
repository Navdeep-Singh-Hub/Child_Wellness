export type MotorSpeechTimingState =
  | 'IDLE'
  | 'SHOWING_PROMPT'
  | 'WAITING_FOR_ATTEMPT'
  | 'RHYTHM_ACTIVE'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type RhythmBeat = 'ma_pause_ma' | 'pa_pause_pa' | 'aaa_pause_aaa' | 'oo_pause_oo' | 'watch';

export type MouthPosture = 'OPEN' | 'CLOSED' | 'ROUNDED' | 'SPREAD' | 'UNKNOWN';

export type MotorSpeechTimingRewardState = 'NONE' | 'SPARKLE' | 'STAR' | 'HERO';

export type MotorSpeechTimingSnapshot = {
  state: MotorSpeechTimingState;
  currentRhythm: RhythmBeat;
  rhythmParticipation: number;
  timingAttempt: number;
  vocalAttempt: number;
  sequenceProgress: number;
  engagementLevel: number;
  rewardState: MotorSpeechTimingRewardState;
  rewardPulse: boolean;
  rhythmPulse: boolean;
  postureHint: MouthPosture | null;
  helperVisible: boolean;
  engagementTimeMs: number;
  rhythmExposure: string[];
};

export type MotorSpeechTimingDifficulty = 'easy' | 'medium' | 'hard';

export type MotorSpeechTimingGameId =
  | 'talking-drum-rhythm'
  | 'speech-beat-robot'
  | 'magic-mouth-metronome'
  | 'talking-train-timing'
  | 'speech-rhythm-hero';

export type MotorSpeechTimingAnalytics = {
  engagementTimeMs: number;
  vocalAttempts: number;
  rhythmAttempts: number;
  sequenceProgress: number;
  rhythmExposure: string[];
  completedGames: number;
  helperCount: number;
  lastUpdated: number;
};
