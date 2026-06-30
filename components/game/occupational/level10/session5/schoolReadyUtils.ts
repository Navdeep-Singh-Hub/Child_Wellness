/** School Ready zone helpers — OT Level 10 Session 5 · Game 1 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { inDailyZone } from '@/components/game/occupational/level10/session5/functionalDailyUtils';
import type { SchoolReadyRound } from '@/components/game/occupational/level10/session5/schoolReadyTheme';

export function inPrepareZone(cursor: Point | null, round: SchoolReadyRound): boolean {
  return inDailyZone(cursor, round.prepare);
}

export function inReadyZone(cursor: Point | null, round: SchoolReadyRound): boolean {
  return inDailyZone(cursor, round.ready);
}
