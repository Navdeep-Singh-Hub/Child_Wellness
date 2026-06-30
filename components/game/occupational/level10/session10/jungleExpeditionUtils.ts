/** Jungle Expedition zone helpers — OT Level 10 Session 10 · Game 1 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { inIntegrationZone } from '@/components/game/occupational/level10/session10/sensoryIntegrationUtils';
import type { JungleExpeditionRound } from '@/components/game/occupational/level10/session10/jungleExpeditionTheme';

export function inScoutZone(cursor: Point | null, round: JungleExpeditionRound): boolean {
  return inIntegrationZone(cursor, round.scout);
}

export function inTrekZone(cursor: Point | null, round: JungleExpeditionRound): boolean {
  return inIntegrationZone(cursor, round.trek);
}
