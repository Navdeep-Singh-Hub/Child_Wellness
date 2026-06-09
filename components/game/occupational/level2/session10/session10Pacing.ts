/**
 * Pacing constants for OT Level 2 Session 10 (mirror drawing games).
 */

export const SESSION10_PACING = {
  totalRounds: 5,
  nextRoundDelayMs: 280,
  mirrorLineX: 50,
  minPathPoints: 8,
  minPathLength: 18,
  pointMinDist: 1.8,
  halfTolerance: 14,
  halfCoverageThreshold: 0.62,
  mazeTolerance: 16,
  goalTolerance: 8,
  objectSize: 38,
  pathStroke: 4,
  faceRadius: 25,
  faceCenterY: 50,
  eyeRadius: 4.5,
  eyeTapMinX: 8,
} as const;
