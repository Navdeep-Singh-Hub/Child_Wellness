/** Rescue Mission zone helpers — OT Level 10 Session 8 · Game 4 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { inProblemZone } from '@/components/game/occupational/level10/session8/problemSolvingUtils';
import type { RescueMissionRound } from '@/components/game/occupational/level10/session8/rescueMissionTheme';

export function inSpotSignalZone(cursor: Point | null, round: RescueMissionRound): boolean {
  return inProblemZone(cursor, round.spot);
}

export function inRescueZone(cursor: Point | null, round: RescueMissionRound): boolean {
  return inProblemZone(cursor, round.rescue);
}
