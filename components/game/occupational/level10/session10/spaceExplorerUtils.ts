/** Space Explorer zone helpers — OT Level 10 Session 10 · Game 2 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { inIntegrationZone } from '@/components/game/occupational/level10/session10/sensoryIntegrationUtils';
import type { SpaceExplorerRound } from '@/components/game/occupational/level10/session10/spaceExplorerTheme';

export function inScanZone(cursor: Point | null, round: SpaceExplorerRound): boolean {
  return inIntegrationZone(cursor, round.scan);
}

export function inFlyZone(cursor: Point | null, round: SpaceExplorerRound): boolean {
  return inIntegrationZone(cursor, round.fly);
}
