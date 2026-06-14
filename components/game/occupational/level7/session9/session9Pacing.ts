/**
 * Pacing & scoring constants for OT Level 7 Session 9 — Vestibular Endurance.
 * Longer sustained holds to build endurance.
 */

export const SESSION9_PACING = {
  calibrationMs: 3000,
  tickMs: 100,

  stepTolerance: 0.24,
  turnThreshold: 0.4,
  balanceThreshold: 0.46,
  stopStillThreshold: 0.6,
  marchMotionMin: 0.05,

  stepLandMs: 650,
  steadyHoldMs: 1400,
  turnHoldMs: 750,
  stopHoldMs: 1300,
  goHoldMs: 1600,

  actionWindowMs: 7500,

  nextRoundDelayMs: 550,
  roundIntroDelayMs: 800,
} as const;
