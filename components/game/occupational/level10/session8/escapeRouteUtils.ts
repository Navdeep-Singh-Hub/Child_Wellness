/** Escape Route zone helpers — OT Level 10 Session 8 · Game 3 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { inProblemZone } from '@/components/game/occupational/level10/session8/problemSolvingUtils';
import type { EscapeRouteRound } from '@/components/game/occupational/level10/session8/escapeRouteTheme';

export function inScoutExitZone(cursor: Point | null, round: EscapeRouteRound): boolean {
  return inProblemZone(cursor, round.scout);
}

export function inEscapeRouteZone(cursor: Point | null, round: EscapeRouteRound): boolean {
  return inProblemZone(cursor, round.escape);
}
