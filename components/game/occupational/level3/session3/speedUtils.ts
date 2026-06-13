/**
 * Re-exports for OT Level 3 Session 3 speed/tempo helpers.
 */
export {
  randomSpeed,
  swipeMatchesMusic,
  swipeMatchesTraffic,
  dragPaceMatches,
  type SpeedKind,
  useTraceSound,
} from '@/components/game/occupational/level3/session3/tempoUtils';

/** @deprecated Use swipeMatchesTraffic or swipeMatchesMusic */
export const swipeSpeedOk = (
  swipeMs: number,
  distance: number,
  target: 'fast' | 'slow',
  fastMaxMs: number,
  slowMinMs: number,
  minDist: number,
) => {
  if (distance < minDist) return false;
  if (target === 'fast') return swipeMs <= fastMaxMs;
  return swipeMs >= slowMinMs;
};
