/** School Adventure zone helpers — OT Level 10 Session 9 · Game 1 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { inRealLifeZone } from '@/components/game/occupational/level10/session9/realLifeSensoryUtils';
import type { SchoolAdventureRound } from '@/components/game/occupational/level10/session9/schoolAdventureTheme';

export function inEnterZone(cursor: Point | null, round: SchoolAdventureRound): boolean {
  return inRealLifeZone(cursor, round.enter);
}

export function inParticipateZone(cursor: Point | null, round: SchoolAdventureRound): boolean {
  return inRealLifeZone(cursor, round.participate);
}
