/**
 * Pacing constants for OT Level 2 Session 6 (shape outline matching games).
 */

export const SESSION6_PACING = {
  totalRounds: 6,
  nextRoundDelayMs: 420,
  fastNextRoundDelayMs: 300,
  /** Shape diameter in the 0–100 play-area SVG coordinate system */
  shapeViewSize: 16,
  /** Draggable shape fill ratio inside its nested 0–100 viewBox */
  shapeInnerSize: 88,
  matchTolerance: 9,
  rotationTolerance: 30,
} as const;
