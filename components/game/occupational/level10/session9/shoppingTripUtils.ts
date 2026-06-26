/** Shopping Trip zone helpers — OT Level 10 Session 9 · Game 2 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { inRealLifeZone } from '@/components/game/occupational/level10/session9/realLifeSensoryUtils';
import type { ShoppingTripRound } from '@/components/game/occupational/level10/session9/shoppingTripTheme';

export function inBrowseAisleZone(cursor: Point | null, round: ShoppingTripRound): boolean {
  return inRealLifeZone(cursor, round.browse);
}

export function inCheckoutZone(cursor: Point | null, round: ShoppingTripRound): boolean {
  return inRealLifeZone(cursor, round.buy);
}
