import type { Level2ImageKey } from '@/components/game/speech/level2-shared/speechLevel2Assets';

/** Maps action choice ids / verbs to PNGs in assets/speech/level2/actions/. */
export const LEVEL2_ACTION_IMAGES: Record<string, Level2ImageKey> = {
  run: 'action-running',
  running: 'action-running',
  sleep: 'action-sleeping',
  sleeping: 'action-sleeping',
  eat: 'action-eating',
  eating: 'action-eating',
  read: 'action-reading',
  reading: 'action-reading',
  sit: 'action-sitting',
  sitting: 'action-sitting',
  drink: 'action-drinking',
  drinking: 'action-drinking',
  kick: 'action-kicking',
  kicking: 'action-kicking',
  paint: 'action-painting',
  painting: 'action-painting',
  write: 'action-writing',
  writing: 'action-writing',
  clap: 'action-clapping',
  clapping: 'action-clapping',
  drive: 'action-driving',
  driving: 'action-driving',
  cry: 'action-crying',
  crying: 'action-crying',
  build: 'action-building',
  building: 'action-building',
  fly: 'action-flying',
  flying: 'action-flying',
  cook: 'action-cooking',
  cooking: 'action-cooking',
  bake: 'action-cooking',
  sing: 'action-singing',
  singing: 'action-singing',
  draw: 'action-drawing',
  drawing: 'action-drawing',
};

export function actionImageKey(id: string): Level2ImageKey | undefined {
  return LEVEL2_ACTION_IMAGES[id.toLowerCase()];
}

/** All 17 action PNG keys under assets/speech/level2/actions/. */
export const ACTION_FOLDER_IMAGES = {
  building: 'action-building',
  clapping: 'action-clapping',
  cooking: 'action-cooking',
  crying: 'action-crying',
  drawing: 'action-drawing',
  drinking: 'action-drinking',
  driving: 'action-driving',
  eating: 'action-eating',
  flying: 'action-flying',
  kicking: 'action-kicking',
  painting: 'action-painting',
  reading: 'action-reading',
  running: 'action-running',
  singing: 'action-singing',
  sitting: 'action-sitting',
  sleeping: 'action-sleeping',
  writing: 'action-writing',
} as const satisfies Record<string, Level2ImageKey>;
