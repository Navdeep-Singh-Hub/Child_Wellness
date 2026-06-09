/**
 * Pacing constants for OT Level 2 Session 7 (trace large shapes games).
 */

export const SESSION7_PACING = {
  totalRounds: 5,
  nextRoundDelayMs: 280,
  completeThreshold: 0.78,
  paintCompleteThreshold: 0.72,
  circleRadius: 35,
  squareSize: 50,
  triangleSize: 45,
  paintSize: 45,
  lineTolerance: 22,
  glowTolerance: 26,
  paintTolerance: 24,
  objectSize: 46,
  pathStroke: 7,
  warnCooldownMs: 320,
} as const;
