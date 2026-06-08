/**
 * Helpers for OT Level 3 Session 2 big vs small movement games.
 */

export type ScaleTarget = 'big' | 'small';

export const randomTarget = (): ScaleTarget => (Math.random() > 0.5 ? 'big' : 'small');

export const swipeMatches = (
  distance: number,
  target: ScaleTarget,
  bigThreshold: number,
  smallThreshold: number,
) => {
  if (target === 'big') return distance >= bigThreshold;
  return distance >= smallThreshold && distance < bigThreshold;
};

export { useTraceSound } from '@/components/game/occupational/level2/session2/traceUtils';
