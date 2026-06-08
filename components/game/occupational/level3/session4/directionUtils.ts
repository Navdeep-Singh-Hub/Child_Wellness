/**
 * Helpers for OT Level 3 Session 4 vertical gesture games.
 */

export type VerticalDir = 'up' | 'down';
export type ElevatorFloor = 'top' | 'ground';

export const randomVerticalDir = (): VerticalDir => (Math.random() > 0.5 ? 'up' : 'down');
export const randomFloor = (): ElevatorFloor => (Math.random() > 0.5 ? 'top' : 'ground');

export const swipeMatchesDir = (
  deltaY: number,
  distance: number,
  required: VerticalDir,
  threshold: number,
) => {
  if (distance < threshold) return false;
  if (required === 'up') return deltaY < 0;
  return deltaY > 0;
};

export { useTraceSound } from '@/components/game/occupational/level2/session2/traceUtils';
