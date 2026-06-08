/**
 * Helpers for OT Level 3 Session 5 horizontal swipe games.
 */

export type HorizontalDir = 'left' | 'right';

export const randomHorizontalDir = (): HorizontalDir => (Math.random() > 0.5 ? 'left' : 'right');

export const swipeToDir = (deltaX: number): HorizontalDir => (deltaX < 0 ? 'left' : 'right');

export const swipeMatchesDir = (deltaX: number, distance: number, required: HorizontalDir, threshold: number) => {
  if (distance < threshold) return false;
  return swipeToDir(deltaX) === required;
};

export const oppositeDir = (d: HorizontalDir): HorizontalDir => (d === 'left' ? 'right' : 'left');

export const ANIMAL_EMOJIS = ['🐕', '🐱', '🐰', '🐔'] as const;

export const randomAnimalEmoji = () => ANIMAL_EMOJIS[Math.floor(Math.random() * ANIMAL_EMOJIS.length)]!;

export { useTraceSound } from '@/components/game/occupational/level2/session2/traceUtils';
