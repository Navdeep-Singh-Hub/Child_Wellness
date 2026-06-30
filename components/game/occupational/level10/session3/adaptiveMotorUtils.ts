import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { distNorm } from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';
import type { PlanTarget } from '@/components/game/occupational/level10/session3/changeThePlanTheme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function inPlanZone(cursor: Point | null, target: PlanTarget): boolean {
  if (!cursor) return false;
  return distNorm(cursor, target) <= target.radius;
}

/** Faster redirect after switch = higher adapt score (ms since switch). */
export function adaptSpeedScore(switchMs: number, quickBonusMs: number): number {
  if (switchMs <= quickBonusMs) return clamp01(0.55 + (1 - switchMs / quickBonusMs) * 0.45);
  return clamp01(0.55 - (switchMs - quickBonusMs) / 8000);
}

export function adaptiveMotorQuality(
  inZone: boolean,
  holdPct: number,
  adaptScore: number,
  postureQ: number,
  smoothness: number,
  attention: number,
): number {
  const zone = inZone ? 0.3 : 0.06;
  const hold = holdPct * 0.22;
  const adapt = adaptScore * 0.28;
  return clamp01(zone + hold + adapt + postureQ * 0.1 + smoothness * 0.06 + attention * 0.04);
}

export function redirectSmoothness(
  prev: Point | null,
  cur: Point | null,
  maxJump = 0.14,
): number {
  if (!prev || !cur) return 0.5;
  const d = distNorm(prev, cur);
  return clamp01(1 - d / maxJump);
}
