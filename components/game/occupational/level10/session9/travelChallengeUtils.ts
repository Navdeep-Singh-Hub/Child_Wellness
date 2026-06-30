/** Travel Challenge zone helpers — OT Level 10 Session 9 · Game 4 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { inRealLifeZone } from '@/components/game/occupational/level10/session9/realLifeSensoryUtils';
import type { TravelChallengeRound } from '@/components/game/occupational/level10/session9/travelChallengeTheme';

export function inPackZone(cursor: Point | null, round: TravelChallengeRound): boolean {
  return inRealLifeZone(cursor, round.pack);
}

export function inTravelZone(cursor: Point | null, round: TravelChallengeRound): boolean {
  return inRealLifeZone(cursor, round.travel);
}
