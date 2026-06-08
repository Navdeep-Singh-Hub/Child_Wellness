/**
 * Pacing constants for OT Level 2 Session 8 (trace small shapes games).
 */

export const SESSION8_PACING = {
  totalRounds: 6,
  nextRoundDelayMs: 420,
  completeThreshold: 0.85,
  tinyCircleRadius: 15,
  carefulCircleRadius: 20,
  miniSquareSize: 20,
  dotShapeSize: 18,
  shrinkInitialRadius: 25,
  shrinkMinRadius: 12,
  lineTolerance: 12,
  carefulTolerance: 10,
  objectSize: 30,
  guideStrokeWidth: 2.5,
  progressStrokeWidth: 3,
  warnCooldownMs: 500,
} as const;
