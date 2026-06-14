/**
 * Pacing & scoring constants for OT Level 7 Session 10 — Vestibular Challenge Course.
 */

export const SESSION10_PACING = {
  calibrationMs: 3000,
  tickMs: 100,

  stepTolerance: 0.24,
  turnThreshold: 0.4,
  balanceThreshold: 0.46,
  stopStillThreshold: 0.6,
  marchMotionMin: 0.05,

  stepLandMs: 600,
  steadyHoldMs: 1200,
  turnHoldMs: 750,
  stopHoldMs: 1150,
  goHoldMs: 1400,

  actionWindowMs: 7000,

  nextRoundDelayMs: 550,
  roundIntroDelayMs: 800,
} as const;
