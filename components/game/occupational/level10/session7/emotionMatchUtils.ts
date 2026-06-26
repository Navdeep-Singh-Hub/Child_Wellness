/** Emotion Match zone helpers — OT Level 10 Session 7 · Game 2 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { inSocialZone } from '@/components/game/occupational/level10/session7/socialSensoryUtils';
import type { EmotionMatchRound } from '@/components/game/occupational/level10/session7/emotionMatchTheme';

export function inFindZone(cursor: Point | null, round: EmotionMatchRound): boolean {
  return inSocialZone(cursor, round.find);
}

export function inMatchZone(cursor: Point | null, round: EmotionMatchRound): boolean {
  return inSocialZone(cursor, round.match);
}
