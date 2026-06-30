export type SpeedCatchMode = 'fast' | 'slow' | 'switch';

export interface SpeedCatchConfig {
  mode: SpeedCatchMode;
  logType: string;
  skillTags: string[];
  instruction: string;
  ttsStart: string;
  ttsSuccess: string;
  speedMin: number;
  speedMax: number;
  ballEmoji: string;
}

export const FAST_CATCH_CONFIG: SpeedCatchConfig = {
  mode: 'fast',
  logType: 'fast-catch',
  skillTags: ['reaction-speed', 'hand-eye-coordination', 'fast-timing'],
  instruction: 'Catch the blazing ball!',
  ttsStart: 'Catch the fast ball!',
  ttsSuccess: 'Lightning catch!',
  speedMin: 3,
  speedMax: 5,
  ballEmoji: '⚽',
};

export const SLOW_CATCH_CONFIG: SpeedCatchConfig = {
  mode: 'slow',
  logType: 'slow-catch',
  skillTags: ['controlled-timing', 'precision', 'slow-motor-control'],
  instruction: 'Tap the drifting ball steadily',
  ttsStart: 'Catch the slow ball!',
  ttsSuccess: 'Slow and steady!',
  speedMin: 0.5,
  speedMax: 1,
  ballEmoji: '🌿',
};

export const SPEED_SWITCH_CONFIG: SpeedCatchConfig = {
  mode: 'switch',
  logType: 'speed-switch',
  skillTags: ['adaptability', 'speed-adjustment', 'flexibility'],
  instruction: 'Adapt as speed changes!',
  ttsStart: 'Watch the speed change!',
  ttsSuccess: 'Great adaptation!',
  speedMin: 0.6,
  speedMax: 1.5,
  ballEmoji: '⚽',
};
