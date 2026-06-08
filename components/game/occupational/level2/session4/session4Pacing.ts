/**
 * Pacing constants for OT Level 2 Session 4 (path-following games).
 */

export const SESSION4_PACING = {
  totalRounds: 6,
  nextRoundDelayMs: 420,
  lineTolerance: 14,
  widePathWidth: 20,
  wideTolerance: 10,
  dotSpacing: 8,
  dotTolerance: 12,
  endTolerance: 14,
  minProgress: 0.88,
  objectSize: 44,
  pathStroke: 3,
  warnIntervalMs: 550,
} as const;
