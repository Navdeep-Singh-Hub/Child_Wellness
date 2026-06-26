import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { distNorm } from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';
import type { WalkStone } from '@/components/game/occupational/level10/session2/slowMotionWalkTheme';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function inStoneZone(cursor: Point | null, stone: WalkStone): boolean {
  if (!cursor) return false;
  return distNorm(cursor, stone) <= stone.radius;
}

export function slowMotionScore(motion: number, maxSlow: number, fastThreshold: number): number {
  if (motion <= maxSlow) return clamp01(0.55 + (1 - motion / maxSlow) * 0.45);
  if (motion >= fastThreshold) return clamp01(0.15 - (motion - fastThreshold) * 2);
  const t = (motion - maxSlow) / (fastThreshold - maxSlow);
  return clamp01(0.55 - t * 0.4);
}

export function slowWalkQualityScore(
  slowScore: number,
  smoothness: number,
  postureQ: number,
  attention: number,
  inZone: boolean,
): number {
  const zone = inZone ? 0.35 : 0.08;
  return clamp01(zone + slowScore * 0.35 + smoothness * 0.15 + postureQ * 0.1 + attention * 0.05);
}

export function isMovingTooFast(motion: number, fastThreshold: number): boolean {
  return motion > fastThreshold;
}
