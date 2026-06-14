/**
 * Pacing & scoring constants for OT Level 7 Session 5 — Dynamic Standing Balance.
 */

export const SESSION5_PACING = {
  calibrationMs: 3000,
  tickMs: 110,

  stepTolerance: 0.24,
  turnThreshold: 0.4,
  balanceThreshold: 0.46,
  stopStillThreshold: 0.6,
  marchMotionMin: 0.05,

  stepLandMs: 600,
  steadyHoldMs: 1100,
  turnHoldMs: 700,
  stopHoldMs: 1200,
  goHoldMs: 1200,

  actionWindowMs: 7000,

  nextRoundDelayMs: 650,
  roundIntroDelayMs: 800,
  fallbackActionMs: 1500,
} as const;
