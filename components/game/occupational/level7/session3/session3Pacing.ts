/**
 * Pacing & scoring constants for OT Level 7 Session 3 — Direction Changes.
 */

export const SESSION3_PACING = {
  calibrationMs: 3000,
  tickMs: 110,

  stepTolerance: 0.23,
  balanceThreshold: 0.44,
  turn90Min: 0.3,
  turn180Min: 0.52,

  shiftDwellMs: 520,
  turn90DwellMs: 850,
  turn180DwellMs: 1100,

  actionWindowMs: 6000,
  fastWindowMs: 5200,

  directionSwitchCount: 8,
  goLeftRightCount: 8,

  nextRoundDelayMs: 600,
  roundIntroDelayMs: 650,
  fallbackDwellMs: 1400,
} as const;
