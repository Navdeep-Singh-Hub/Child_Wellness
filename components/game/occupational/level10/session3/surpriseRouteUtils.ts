import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { distNorm } from '@/components/game/occupational/level10/session1/sensoryTrackingUtils';
import type { TrailMarker } from '@/components/game/occupational/level10/session3/surpriseRouteTheme';

export function inTrailZone(cursor: Point | null, marker: TrailMarker): boolean {
  if (!cursor) return false;
  return distNorm(cursor, marker) <= marker.radius;
}
