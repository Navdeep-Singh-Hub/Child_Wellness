/**
 * Helpers for OT Level 3 Session 3 speed games.
 */

export type SpeedKind = 'fast' | 'slow';

export const randomSpeed = (): SpeedKind => (Math.random() > 0.5 ? 'fast' : 'slow');

export const swipeSpeedOk = (
  swipeMs: number,
  distance: number,
  target: SpeedKind,
  fastMaxMs: number,
  slowMinMs: number,
  minDist: number,
) => {
  if (distance < minDist) return false;
  if (target === 'fast') return swipeMs <= fastMaxMs;
  return swipeMs >= slowMinMs;
};

export { useTraceSound } from '@/components/game/occupational/level2/session2/traceUtils';
