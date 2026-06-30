/** Playground Quest zone helpers — OT Level 10 Session 9 · Game 3 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { inRealLifeZone } from '@/components/game/occupational/level10/session9/realLifeSensoryUtils';
import type { PlaygroundQuestRound } from '@/components/game/occupational/level10/session9/playgroundQuestTheme';

export function inExploreStationZone(cursor: Point | null, round: PlaygroundQuestRound): boolean {
  return inRealLifeZone(cursor, round.explore);
}

export function inPlayZone(cursor: Point | null, round: PlaygroundQuestRound): boolean {
  return inRealLifeZone(cursor, round.play);
}
