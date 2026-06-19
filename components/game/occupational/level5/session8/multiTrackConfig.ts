export type MultiTrackMode = 'follow-red' | 'two-balls' | 'speed-pick';

export interface MultiTrackConfig {
  mode: MultiTrackMode;
  logType: string;
  skillTags: string[];
  instruction: string;
  ttsStart: string;
  ttsSuccess: string;
  ttsMiss: string;
  objectCount: number;
  objectSize: number;
  speed: number;
  slowSpeed?: number;
}

export const FOLLOW_RED_CONFIG: MultiTrackConfig = {
  mode: 'follow-red',
  logType: 'follow-red',
  skillTags: ['selective-attention', 'object-tracking', 'color-discrimination'],
  instruction: 'Tap the red object!',
  ttsStart: 'Follow the red object!',
  ttsSuccess: 'Red object caught!',
  ttsMiss: 'Follow the red object!',
  objectCount: 5,
  objectSize: 52,
  speed: 1.5,
};

export const TWO_BALLS_CONFIG: MultiTrackConfig = {
  mode: 'two-balls',
  logType: 'two-moving-balls',
  skillTags: ['filtering-skill', 'object-discrimination', 'attention'],
  instruction: 'Tap the starred ball!',
  ttsStart: 'Tap the starred ball!',
  ttsSuccess: 'Correct ball!',
  ttsMiss: 'Tap the starred ball!',
  objectCount: 2,
  objectSize: 62,
  speed: 2,
};

export const SPEED_OBJECTS_CONFIG: MultiTrackConfig = {
  mode: 'speed-pick',
  logType: 'speed-objects',
  skillTags: ['tracking-control', 'speed-discrimination', 'multi-object-tracking'],
  instruction: 'Match the called speed!',
  ttsStart: 'Match the speed!',
  ttsSuccess: 'Correct speed!',
  ttsMiss: 'Wrong speed!',
  objectCount: 4,
  objectSize: 52,
  speed: 3,
  slowSpeed: 0.8,
};
