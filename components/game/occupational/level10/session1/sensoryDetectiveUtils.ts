import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';
import type {
  DetectiveCase,
  EvidenceClue,
} from '@/components/game/occupational/level10/session1/sensoryDetectiveTheme';
import { MAGNIFIER_STATION } from '@/components/game/occupational/level10/session1/sensoryDetectiveTheme';

export function distNorm(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function inClueZone(cursor: Point | null, clue: EvidenceClue): boolean {
  if (!cursor) return false;
  return distNorm(cursor, clue) <= clue.radius;
}

export function clueAtCursor(cursor: Point | null, clues: EvidenceClue[]): EvidenceClue | null {
  if (!cursor) return null;
  for (const clue of clues) {
    if (inClueZone(cursor, clue)) return clue;
  }
  return null;
}

export function inMagnifierZone(cursor: Point | null): boolean {
  if (!cursor) return false;
  return distNorm(cursor, MAGNIFIER_STATION) <= MAGNIFIER_STATION.radius;
}

export function isCorrectClue(clue: EvidenceClue, detectiveCase: DetectiveCase): boolean {
  return clue.id === detectiveCase.correctClueId;
}

export function solveSatisfied(
  cursor: Point | null,
  detectiveCase: DetectiveCase,
  scanned: boolean,
): boolean {
  if (detectiveCase.needsScan && !scanned) return false;
  const clue = clueAtCursor(cursor, detectiveCase.clues);
  return Boolean(clue && isCorrectClue(clue, detectiveCase));
}
