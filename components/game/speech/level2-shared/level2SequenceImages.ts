import type { Level2ImageKey } from '@/components/game/speech/level2-shared/speechLevel2Assets';

/** Story-order sequence steps (assets/speech/level2/sequenceordericons/). */
export const SEQUENCE_STORY_IMAGES = {
  plantSeed: 'plant-seed',
  waterCan: 'watering-can',
  flowerBloom: 'flower-bloom',
  breadLoaf: 'bread-loaf',
  bathTub: 'bath-tub',
  pajamas: 'pajamas',
  sleepBed: 'sleeping-child',
} as const satisfies Record<string, Level2ImageKey>;

/** First / middle / last position icons. */
export const SEQUENCE_POSITION_IMAGES = {
  firstMedal: 'medal-first',
  lastFinish: 'finish-flag',
  morning: 'sunrise',
  noon: 'sun-noon',
  night: 'moon-night',
  one: 'number-1',
  two: 'number-2',
  three: 'number-3',
} as const satisfies Record<string, Level2ImageKey>;
