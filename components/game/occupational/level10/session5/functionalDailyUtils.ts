/**
 * OT Level 10 · Session 5 — Functional Daily Skills shared scoring.
 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { distNorm } from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function inDailyZone(cursor: Point | null, zone: Point & { radius: number }): boolean {
  if (!cursor) return false;
  return distNorm(cursor, zone) <= zone.radius;
}

export function functionalDailyQuality(
  preparing: boolean,
  ready: boolean,
  holdPct: number,
  postureQ: number,
  attention: number,
  smoothness: number,
  phase: 'prepare' | 'ready',
): number {
  const prep = phase === 'prepare' && preparing ? 0.28 : preparing ? 0.1 : 0.05;
  const rdy = phase === 'ready' && ready ? 0.3 : ready ? 0.1 : 0.04;
  const hold = holdPct * 0.2;
  return clamp01(prep + rdy + hold + postureQ * 0.1 + attention * 0.06 + smoothness * 0.08);
}
