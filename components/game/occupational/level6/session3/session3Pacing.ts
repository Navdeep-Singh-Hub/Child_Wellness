/**
 * Pacing & scoring constants for OT Level 6 Session 3 — Head & Neck Stability.
 */

export const SESSION3_PACING = {
  calibrationMs: 3000,
  tickMs: 100, // faster sampling for smooth tracking

  // On-target tolerance for head cursor vs target (normalized distance).
  trackTolerance: 0.18,
  // Direction-zone hold threshold for cursor proximity.
  holdTolerance: 0.2,

  // ── Rocket Watch ── (follow moving rocket)
  rocketRounds: 3,
  rocketRoundMs: 9000,

  // ── Look & Hold ── (command + hold)
  lookHoldRounds: 4, // one direction per round
  lookHoldTargetMs: 2500, // time the look must be held to score
  lookHoldWindowMs: 7000, // max time allowed to reach + hold

  // ── Sky-Ground Explorer ── (alternate up/down)
  skyGroundRounds: 6, // alternating up/down reps
  skyGroundReachMs: 5000,

  // ── Keep The Crown ── (smooth head turns)
  crownRounds: 4, // one direction per round
  crownTurnMs: 6000,
  crownSmoothTol: 0.06, // head cursor jerk above this wobbles the crown

  // ── Star Tracker ── (multiple pursuit patterns)
  starPatternMs: 8000, // per pattern

  nextRoundDelayMs: 700,
  roundIntroDelayMs: 700,
  fallbackHoldMs: 4000,
} as const;
