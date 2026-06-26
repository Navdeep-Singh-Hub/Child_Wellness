/** Meal Mission zone helpers — OT Level 10 Session 5 · Game 3 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { inDailyZone } from '@/components/game/occupational/level10/session5/functionalDailyUtils';
import type { MealMissionRound } from '@/components/game/occupational/level10/session5/mealMissionTheme';

export function inPrepareZone(cursor: Point | null, round: MealMissionRound): boolean {
  return inDailyZone(cursor, round.prepare);
}

export function inReadyZone(cursor: Point | null, round: MealMissionRound): boolean {
  return inDailyZone(cursor, round.ready);
}
