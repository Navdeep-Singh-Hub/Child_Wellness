/**
 * Pacing constants for OT Level 2 Session 10 (mirror drawing games).
 */

export const SESSION10_PACING = {
  totalRounds: 6,
  nextRoundDelayMs: 420,
  mirrorLineX: 50,
  minPathPoints: 10,
  goalTolerance: 5,
  objectSize: 30,
  faceRadius: 25,
  faceCenterY: 50,
} as const;
