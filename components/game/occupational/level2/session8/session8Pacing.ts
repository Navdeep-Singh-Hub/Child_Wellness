/**
 * Pacing constants for OT Level 2 Session 8 (trace small shapes games).
 */

export const SESSION8_PACING = {
  totalRounds: 5,
  nextRoundDelayMs: 280,
  completeThreshold: 0.74,
  tinyCircleRadius: 18,
  carefulCircleRadius: 22,
  miniSquareSize: 24,
  dotShapeSize: 22,
  shrinkInitialRadius: 26,
  shrinkMinRadius: 14,
  lineTolerance: 16,
  carefulTolerance: 14,
  minTolerance: 10,
  objectSize: 42,
  guideStrokeWidth: 4,
  pathStroke: 5,
  warnCooldownMs: 320,
} as const;
