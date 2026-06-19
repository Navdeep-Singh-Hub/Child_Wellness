/**
 * Pacing & scoring constants for OT Level 8 Session 1 — Single-Step Motor Planning.
 *
 * Each round has a short "plan" beat (motor planning) followed by an "execute"
 * window in which the child reaches/moves to the target. Reaching the target
 * zone and holding it briefly confirms a controlled, planned movement.
 */

export const SESSION1_PACING = {
  calibrationMs: 2600,
  tickMs: 90,

  // Reach detection (normalized screen distance from target anchor).
  reachRadius: 0.17, // hand-reach tolerance
  bodyRadiusScale: 1.4, // body "stand on spot" is more generous
  bothHandsRadiusScale: 1.6, // launch: both wrists near the high zone

  // Hold the hand/body near the target this long to confirm a planned reach.
  holdToConfirmMs: 320,
  // Small grace so a brief wobble out of zone doesn't reset the hold.
  holdGraceMs: 160,

  // "Plan" beat before the target activates each round.
  planDelayMs: 750,

  // Movement-quality scoring: reward controlled motion, penalise frantic jerk.
  intensityCeiling: 0.16,
  jerkHigh: 0.6, // intensity above this hurts movement-quality

  maxGameMs: 85000,
  betweenRoundsMs: 850,
  // Guided (no-camera) fallback: auto-complete a round after this long.
  fallbackReachMs: 1900,

  starEveryNRounds: 2,
} as const;
