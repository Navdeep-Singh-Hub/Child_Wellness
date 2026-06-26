import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { distNorm } from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';
import type { SafeStone } from '@/components/game/occupational/level10/session3/lavaShiftTheme';

export function inSafeStone(cursor: Point | null, stone: SafeStone): boolean {
  if (!cursor) return false;
  return distNorm(cursor, stone) <= stone.radius;
}
