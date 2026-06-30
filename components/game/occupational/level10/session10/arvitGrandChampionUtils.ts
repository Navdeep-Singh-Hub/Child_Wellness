import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { inIntegrationZone } from '@/components/game/occupational/level10/session10/sensoryIntegrationUtils';

export function inChampionZone(cursor: Point | null, zone: Point & { radius: number }): boolean {
  return inIntegrationZone(cursor, zone);
}
