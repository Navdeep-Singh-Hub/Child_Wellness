/**
 * Pacing constants for OT Level 2 Session 6 (shape outline matching games).
 */

export const SESSION6_PACING = {
  totalRounds: 6,
  nextRoundDelayMs: 420,
  fastNextRoundDelayMs: 300,
  shapeSize: 50,
  matchTolerance: 14,
  rotationTolerance: 30,
} as const;
