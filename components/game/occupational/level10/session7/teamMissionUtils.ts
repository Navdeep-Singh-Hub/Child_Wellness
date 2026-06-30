/** Team Mission zone helpers — OT Level 10 Session 7 · Game 3 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { inSocialZone } from '@/components/game/occupational/level10/session7/socialSensoryUtils';
import type { TeamMissionRound } from '@/components/game/occupational/level10/session7/teamMissionTheme';

export function inRallyZone(cursor: Point | null, round: TeamMissionRound): boolean {
  return inSocialZone(cursor, round.rally);
}

export function inMissionZone(cursor: Point | null, round: TeamMissionRound): boolean {
  return inSocialZone(cursor, round.mission);
}
