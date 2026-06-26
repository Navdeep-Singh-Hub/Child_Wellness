/** Friendship Quest zone helpers — OT Level 10 Session 7 · Game 4 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { inSocialZone } from '@/components/game/occupational/level10/session7/socialSensoryUtils';
import type { FriendshipQuestRound } from '@/components/game/occupational/level10/session7/friendshipQuestTheme';

export function inTrailZone(cursor: Point | null, round: FriendshipQuestRound): boolean {
  return inSocialZone(cursor, round.trail);
}

export function inBondZone(cursor: Point | null, round: FriendshipQuestRound): boolean {
  return inSocialZone(cursor, round.bond);
}
