/** Mountain Rescue zone helpers — OT Level 10 Session 10 · Game 4 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { inIntegrationZone } from '@/components/game/occupational/level10/session10/sensoryIntegrationUtils';
import type { MountainRescueRound } from '@/components/game/occupational/level10/session10/mountainRescueTheme';

export function inSpotZone(cursor: Point | null, round: MountainRescueRound): boolean {
  return inIntegrationZone(cursor, round.spot);
}

export function inRescueZone(cursor: Point | null, round: MountainRescueRound): boolean {
  return inIntegrationZone(cursor, round.rescue);
}
