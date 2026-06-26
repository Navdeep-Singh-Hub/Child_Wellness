/** Door Challenge zone helpers — OT Level 10 Session 5 · Game 4 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { inDailyZone } from '@/components/game/occupational/level10/session5/functionalDailyUtils';
import type { DoorChallengeRound } from '@/components/game/occupational/level10/session5/doorChallengeTheme';

export function inApproachZone(cursor: Point | null, round: DoorChallengeRound): boolean {
  return inDailyZone(cursor, round.prepare);
}

export function inReadyZone(cursor: Point | null, round: DoorChallengeRound): boolean {
  return inDailyZone(cursor, round.ready);
}
