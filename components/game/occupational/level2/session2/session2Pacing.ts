/**
 * Pacing constants for OT Level 2 Session 2 (curved trace games).
 */

export const SESSION2_PACING = {
  totalRounds: 6,
  nextRoundDelayMs: 420,
  lineTolerance: 28,
  endTolerance: 28,
  minProgress: 0.88,
  objectSize: 48,
  pathStroke: 3,
  warnIntervalMs: 550,
} as const;
