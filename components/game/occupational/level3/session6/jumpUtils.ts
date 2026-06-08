/**
 * Helpers for OT Level 3 Session 6 jump / double-tap games.
 */

export const rhythmMatches = (taps: number[], expectedMs: number, toleranceMs: number) => {
  if (taps.length !== 2) return false;
  const interval = taps[1]! - taps[0]!;
  return Math.abs(interval - expectedMs) <= toleranceMs;
};

export const randomJumpNumber = () => Math.floor(Math.random() * 3) + 1;

export { useTraceSound } from '@/components/game/occupational/level2/session2/traceUtils';
