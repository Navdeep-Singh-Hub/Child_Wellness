/** Focus Finder zone helpers — OT Level 10 Session 6 · Game 1 */
import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import { inAttentionZone } from '@/components/game/occupational/level10/session6/attentionRegulationUtils';
import type { FocusFinderRound } from '@/components/game/occupational/level10/session6/focusFinderTheme';

export function inSeekZone(cursor: Point | null, round: FocusFinderRound): boolean {
  return inAttentionZone(cursor, round.seek);
}

export function inFocusZone(cursor: Point | null, round: FocusFinderRound): boolean {
  return inAttentionZone(cursor, round.focus);
}
