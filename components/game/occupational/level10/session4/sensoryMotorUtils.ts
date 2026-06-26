/**
 * OT Level 10 · Session 4 — Sensory-Motor Integration shared scoring.
 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { distNorm } from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export type BalanceZone = Point & { radius: number };

export function inBalanceZone(center: Point | null, zone: BalanceZone): boolean {
  if (!center) return false;
  return distNorm(center, zone) <= zone.radius;
}

export function inReachZone(hand: Point | null, target: Point & { radius: number }): boolean {
  if (!hand) return false;
  return distNorm(hand, target) <= target.radius;
}

/** Lower body drift during balance = higher stability. */
export function balanceStability(prev: Point | null, cur: Point | null, maxJump = 0.09): number {
  if (!prev || !cur) return 0.5;
  return clamp01(1 - distNorm(prev, cur) / maxJump);
}

export function sensoryMotorQuality(
  balanced: boolean,
  reaching: boolean,
  holdPct: number,
  stability: number,
  postureQ: number,
  attention: number,
  reachSmooth: number,
): number {
  const bal = balanced ? 0.28 : 0.06;
  const reach = reaching ? 0.26 : 0.04;
  const hold = holdPct * 0.2;
  const stab = stability * 0.12;
  return clamp01(bal + reach + hold + stab + postureQ * 0.08 + attention * 0.04 + reachSmooth * 0.06);
}
