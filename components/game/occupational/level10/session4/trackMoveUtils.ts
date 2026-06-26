import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { distNorm } from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';
import type { TrailPath } from '@/components/game/occupational/level10/session4/trackMoveTheme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function lerpPoint(a: Point, b: Point, t: number): Point {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/** Slight arc bow for arc paths. */
export function guidePosition(start: Point, end: Point, t: number, path: TrailPath): Point {
  const linear = lerpPoint(start, end, t);
  if (path !== 'arc') return linear;
  const bow = Math.sin(t * Math.PI) * 0.08;
  return { x: linear.x, y: linear.y - bow };
}

export function inGuideZone(cursor: Point | null, guide: Point, radius: number): boolean {
  if (!cursor) return false;
  return distNorm(cursor, guide) <= radius;
}

export function inFinishZone(cursor: Point | null, end: Point, radius: number): boolean {
  if (!cursor) return false;
  return distNorm(cursor, end) <= radius;
}

export function trackMoveQuality(
  tracking: boolean,
  atFinish: boolean,
  holdPct: number,
  trackPct: number,
  smoothness: number,
  postureQ: number,
  attention: number,
): number {
  const track = tracking ? 0.26 : trackPct * 0.12;
  const move = atFinish ? 0.28 : 0.05;
  const hold = holdPct * 0.2;
  return clamp01(track + move + hold + smoothness * 0.1 + postureQ * 0.08 + attention * 0.05);
}
