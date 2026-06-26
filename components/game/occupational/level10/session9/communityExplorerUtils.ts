/** Community Explorer zone helpers — OT Level 10 Session 9 · Game 5 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { inRealLifeZone } from '@/components/game/occupational/level10/session9/realLifeSensoryUtils';
import type { CommunityExplorerRound } from '@/components/game/occupational/level10/session9/communityExplorerTheme';

export function inVisitZone(cursor: Point | null, round: CommunityExplorerRound): boolean {
  return inRealLifeZone(cursor, round.visit);
}

export function inJoinZone(cursor: Point | null, round: CommunityExplorerRound): boolean {
  return inRealLifeZone(cursor, round.join);
}
