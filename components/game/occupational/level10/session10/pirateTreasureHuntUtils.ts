/** Pirate Treasure Hunt zone helpers — OT Level 10 Session 10 · Game 3 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { inIntegrationZone } from '@/components/game/occupational/level10/session10/sensoryIntegrationUtils';
import type { PirateTreasureHuntRound } from '@/components/game/occupational/level10/session10/pirateTreasureHuntTheme';

export function inSeekZone(cursor: Point | null, round: PirateTreasureHuntRound): boolean {
  return inIntegrationZone(cursor, round.seek);
}

export function inClaimZone(cursor: Point | null, round: PirateTreasureHuntRound): boolean {
  return inIntegrationZone(cursor, round.claim);
}
