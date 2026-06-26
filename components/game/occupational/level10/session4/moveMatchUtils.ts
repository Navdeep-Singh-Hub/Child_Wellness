import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { distNorm } from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function inMoveZone(cursor: Point | null, zone: Point & { radius: number }): boolean {
  if (!cursor) return false;
  return distNorm(cursor, zone) <= zone.radius;
}

export function inMatchZone(cursor: Point | null, zone: Point & { radius: number }): boolean {
  if (!cursor) return false;
  return distNorm(cursor, zone) <= zone.radius;
}

export function moveMatchQuality(
  onMove: boolean,
  onMatch: boolean,
  holdPct: number,
  smoothness: number,
  postureQ: number,
  attention: number,
): number {
  const move = onMove ? 0.28 : 0.06;
  const match = onMatch ? 0.28 : 0.05;
  const hold = holdPct * 0.2;
  return clamp01(move + match + hold + smoothness * 0.1 + postureQ * 0.08 + attention * 0.05);
}
