/**
 * Pacing & scoring constants for OT Level 8 Session 4 — Motor Imitation.
 *
 * Each round: a character demonstrates a pose ("plan" beat), then the child
 * copies it. Holding a correct match for the confirm window scores the imitation.
 */

export const SESSION4_PACING = {
  calibrationMs: 2600,
  tickMs: 90,

  // Hold a correct match this long to confirm the imitation.
  matchHoldMs: 650,
  quickHoldMs: 380,
  holdGraceMs: 200,

  // Demonstration "plan" beat before the child copies.
  planDelayMs: 1100,
  quickPlanMs: 650,

  // Movement-quality scoring.
  intensityCeiling: 0.18,
  jerkHigh: 0.8,

  maxGameMs: 95000,
  betweenRoundsMs: 850,
  fallbackMatchMs: 1700, // guided auto-complete per pose

  starEveryNRounds: 2,
} as const;
