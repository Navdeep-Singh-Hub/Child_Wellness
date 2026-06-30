/** Greeting Game zone helpers — OT Level 10 Session 7 · Game 1 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { inSocialZone } from '@/components/game/occupational/level10/session7/socialSensoryUtils';
import type { GreetingGameRound } from '@/components/game/occupational/level10/session7/greetingGameTheme';

export function inApproachZone(cursor: Point | null, round: GreetingGameRound): boolean {
  return inSocialZone(cursor, round.approach);
}

export function inGreetZone(cursor: Point | null, round: GreetingGameRound): boolean {
  return inSocialZone(cursor, round.greet);
}
