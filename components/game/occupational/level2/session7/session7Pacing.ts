/**
 * Pacing constants for OT Level 2 Session 7 (trace large shapes games).
 */

export const SESSION7_PACING = {
  totalRounds: 6,
  nextRoundDelayMs: 420,
  completeThreshold: 0.85,
  circleRadius: 35,
  squareSize: 50,
  triangleSize: 45,
  paintSize: 45,
  lineTolerance: 18,
  glowTolerance: 22,
  paintTolerance: 20,
  objectSize: 36,
  warnCooldownMs: 500,
} as const;
