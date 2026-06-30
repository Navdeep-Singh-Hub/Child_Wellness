/** Find Another Way zone helpers — OT Level 10 Session 8 · Game 1 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { inProblemZone } from '@/components/game/occupational/level10/session8/problemSolvingUtils';
import type { FindAnotherWayRound } from '@/components/game/occupational/level10/session8/findAnotherWayTheme';

export function inTryZone(cursor: Point | null, round: FindAnotherWayRound): boolean {
  return inProblemZone(cursor, round.try);
}

export function inAdaptZone(cursor: Point | null, round: FindAnotherWayRound): boolean {
  return inProblemZone(cursor, round.adapt);
}
