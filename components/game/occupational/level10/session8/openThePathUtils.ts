/** Open The Path zone helpers — OT Level 10 Session 8 · Game 2 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { inProblemZone } from '@/components/game/occupational/level10/session8/problemSolvingUtils';
import type { OpenThePathRound } from '@/components/game/occupational/level10/session8/openThePathTheme';

export function inFindGateZone(cursor: Point | null, round: OpenThePathRound): boolean {
  return inProblemZone(cursor, round.find);
}

export function inOpenPathZone(cursor: Point | null, round: OpenThePathRound): boolean {
  return inProblemZone(cursor, round.open);
}
