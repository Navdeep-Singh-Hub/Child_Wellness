/**
 * Pacing & scoring constants for OT Level 7 Session 8 — Vestibular Sequencing.
 */

export const SESSION8_PACING = {
  calibrationMs: 3000,
  tickMs: 100,

  stepTolerance: 0.24,
  turnThreshold: 0.4,
  balanceThreshold: 0.46,
  stopStillThreshold: 0.6,
  marchMotionMin: 0.05,

  stepLandMs: 600,
  steadyHoldMs: 1050,
  turnHoldMs: 700,
  stopHoldMs: 1050,
  goHoldMs: 1150,

  actionWindowMs: 7000,

  nextRoundDelayMs: 600,
  roundIntroDelayMs: 800,
} as const;
