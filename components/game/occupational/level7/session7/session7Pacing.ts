/**
 * Pacing & scoring constants for OT Level 7 Session 7 — Balance Reactions.
 * Tuned for quicker reactions and shorter holds than Session 5.
 */

export const SESSION7_PACING = {
  calibrationMs: 3000,
  tickMs: 100,

  stepTolerance: 0.24,
  turnThreshold: 0.4,
  balanceThreshold: 0.46,
  stopStillThreshold: 0.6,
  marchMotionMin: 0.05,

  stepLandMs: 550,
  steadyHoldMs: 950,
  turnHoldMs: 650,
  stopHoldMs: 900,
  goHoldMs: 1100,

  actionWindowMs: 6000,

  nextRoundDelayMs: 550,
  roundIntroDelayMs: 700,
} as const;
