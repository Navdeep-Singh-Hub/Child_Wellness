/**
 * Helpers for OT Level 4 Session 7 cross-body arrow games.
 */

export { useTraceSound } from '@/components/game/occupational/level4/session1/dragUtils';

export type ArrowDirection = 'left' | 'right' | 'up' | 'down';
export type Hand = 'left' | 'right';

const DIRECTIONS: ArrowDirection[] = ['left', 'right', 'up', 'down'];

export const randomDirection = (): ArrowDirection =>
  DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];

export const arrowEmoji = (dir: ArrowDirection): string => {
  switch (dir) {
    case 'left':
      return '⬅️';
    case 'right':
      return '➡️';
    case 'up':
      return '⬆️';
    case 'down':
      return '⬇️';
  }
};

/** Left arrow → right hand, right arrow → left hand; up/down use fixed cross-body mapping. */
export const crossBodyHand = (dir: ArrowDirection): Hand => {
  if (dir === 'left') return 'right';
  if (dir === 'right') return 'left';
  if (dir === 'up') return 'right';
  return 'left';
};

/** Cross-body swipe: opposite horizontal, inverted vertical. */
export const crossBodySwipe = (dir: ArrowDirection): ArrowDirection => {
  switch (dir) {
    case 'left':
      return 'right';
    case 'right':
      return 'left';
    case 'up':
      return 'down';
    case 'down':
      return 'up';
  }
};

export const swipeFromDelta = (dx: number, dy: number): ArrowDirection | null => {
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  if (absX < 8 && absY < 8) return null;
  if (absX >= absY) return dx < 0 ? 'left' : 'right';
  return dy < 0 ? 'up' : 'down';
};

export const handLabel = (hand: Hand) => (hand === 'left' ? 'LEFT' : 'RIGHT');
