import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { distNorm } from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';
import type { PirateWaypoint } from '@/components/game/occupational/level10/session3/pirateDetourTheme';

export function inDetourZone(cursor: Point | null, waypoint: PirateWaypoint): boolean {
  if (!cursor) return false;
  return distNorm(cursor, waypoint) <= waypoint.radius;
}
