/**
 * Helpers for OT Level 3 Session 7 swing games.
 */

export type SwingDir = 'left' | 'right';

export const normalizeAngleDelta = (delta: number) => {
  let d = delta;
  if (d > Math.PI) d -= 2 * Math.PI;
  if (d < -Math.PI) d += 2 * Math.PI;
  return d;
};

export const swipeDistance = (dx: number, dy: number) => Math.sqrt(dx * dx + dy * dy);

export const onBeat = (now: number, lastBeat: number, intervalMs: number, toleranceMs: number) => {
  const since = (now - lastBeat) % intervalMs;
  const diff = Math.min(since, intervalMs - since);
  return diff <= toleranceMs;
};

export { useTraceSound } from '@/components/game/occupational/level2/session2/traceUtils';
