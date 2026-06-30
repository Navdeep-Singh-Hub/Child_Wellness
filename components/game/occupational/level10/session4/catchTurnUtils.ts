import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { distNorm } from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';
import { lerpPoint } from '@/components/game/occupational/level10/session4/trackMoveUtils';

export { lerpPoint };

export function orbPosition(spawn: Point, target: Point, t: number): Point {
  return lerpPoint(spawn, target, t);
}

export function inCatchZone(hand: Point | null, catchPt: Point & { radius: number }): boolean {
  if (!hand) return false;
  return distNorm(hand, catchPt) <= catchPt.radius;
}

export function inTurnZone(cursor: Point | null, turnPt: Point & { radius: number }): boolean {
  if (!cursor) return false;
  return distNorm(cursor, turnPt) <= turnPt.radius;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function catchTurnQuality(
  catching: boolean,
  turning: boolean,
  holdPct: number,
  flightProgress: number,
  smoothness: number,
  postureQ: number,
  attention: number,
): number {
  const cat = catching ? 0.28 : flightProgress * 0.1;
  const turn = turning ? 0.28 : 0.05;
  const hold = holdPct * 0.2;
  return clamp01(cat + turn + hold + smoothness * 0.1 + postureQ * 0.08 + attention * 0.05);
}
