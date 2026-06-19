/**
 * Pacing & scoring constants for OT Level 8 Session 2 — Two-Step Motor Planning.
 *
 * Each round: a "plan" beat showing BOTH steps, then the child executes step 1,
 * then step 2, in order. Target steps use a reach radius; gesture steps use the
 * thresholds below.
 */

export const SESSION2_PACING = {
  calibrationMs: 2600,
  tickMs: 90,

  // Target reach (touch · reach · pick · place).
  reachRadius: 0.17,
  reachHoldMs: 300,
  holdGraceMs: 160,

  // Gesture thresholds (normalized).
  clapDist: 0.16, // wrist-to-wrist distance to count "hands together"
  clapHoldMs: 200,
  clapMinY: 0.32, // clap should be around chest, not overhead
  clapMaxY: 0.7,

  jumpRise: 0.05, // baseline COM y minus current COM y (body moves up)

  turnShrinkRatio: 0.74, // shoulderWidth / baseline below this = turned sideways
  turnHoldMs: 260,

  freezeHoldMs: 1000, // must stay still this long
  freezeMotionMax: 0.05, // whole-body motion under this counts as frozen

  launchY: 0.32, // both wrists at/above this y = raised
  launchHoldMs: 220,

  catchDist: 0.18, // both hands together for the catch
  catchMinY: 0.4,
  catchMaxY: 0.66,
  catchHoldMs: 200,

  // Movement-quality scoring.
  intensityCeiling: 0.18,
  jerkHigh: 0.75, // two-step games are naturally energetic — relaxed jerk gate

  planDelayMs: 900,
  maxGameMs: 90000,
  betweenStepsMs: 650,
  betweenRoundsMs: 850,
  fallbackStepMs: 1500, // guided auto-complete per step

  starEveryNRounds: 2,
} as const;
