import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { distNorm } from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';
import type { MissionBeacon } from '@/components/game/occupational/level10/session3/missionUpdateTheme';

export function inBeaconZone(cursor: Point | null, beacon: MissionBeacon): boolean {
  if (!cursor) return false;
  return distNorm(cursor, beacon) <= beacon.radius;
}
