/**
 * Pacing & scoring constants for OT Level 8 Session 3 — Multi-Step Sequencing.
 *
 * Each round: a "plan" beat that previews the whole ordered chain, then the
 * child executes each step in order. Detection thresholds live in the shared
 * motorActions module; this file owns timing and round flow.
 */

export const SESSION3_PACING = {
  calibrationMs: 2600,
  tickMs: 90,

  holdGraceMs: 160,

  // Movement-quality scoring.
  intensityCeiling: 0.18,
  jerkHigh: 0.75,

  // Plan beat scales a little with chain length (longer chains = more preview).
  planBaseMs: 1100,
  planPerStepMs: 350,

  maxGameMs: 120000,
  betweenStepsMs: 550,
  betweenRoundsMs: 900,
  fallbackStepMs: 1300, // guided auto-complete per step

  starEveryNRounds: 2,
} as const;
