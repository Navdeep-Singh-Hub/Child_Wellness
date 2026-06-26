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
  /** Speed Storm: slow targets to clear (one per round). */
  slowCount?: number;
  /** Speed Storm: fast distractors on the field. */
  fastCount?: number;
  rounds?: number;
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
  instruction: 'Tap the star only when it is inside a box!',
  ttsStart: 'Tap the star when it enters a box!',
  ttsSuccess: 'Star caught in the box!',
  ttsMiss: 'Tap only the star inside a box!',
  objectCount: 2,
  objectSize: 62,
  speed: 2,
};

export const SPEED_OBJECTS_CONFIG: MultiTrackConfig = {
  mode: 'speed-pick',
  logType: 'speed-objects',
  skillTags: ['tracking-control', 'speed-discrimination', 'multi-object-tracking'],
  instruction: 'Tap each slow turtle — one vanishes every round!',
  ttsStart: 'Tap a slow turtle!',
  ttsSuccess: 'Slow one caught!',
  ttsMiss: 'Tap the slow turtle, not the fast one!',
  objectCount: 24,
  objectSize: 48,
  speed: 3,
  slowSpeed: 0.75,
  slowCount: 10,
  fastCount: 14,
  rounds: 10,
};
