/**
 * Pacing & scoring constants for OT Level 7 Session 2 — Head Movement & Vestibular Activation.
 */

export const SESSION2_PACING = {
  calibrationMs: 3000,
  tickMs: 100,

  trackTolerance: 0.19,
  holdTolerance: 0.21,
  lookHoldTargetMs: 2200,
  lookHoldWindowMs: 6500,

  lookUpRounds: 5,
  lookUpWindowMs: 6000,

  skyGroundRounds: 6,
  skyGroundReachMs: 4800,

  helicopterRounds: 4,
  helicopterRoundMs: 8500,

  starPatterns: 4,
  starPatternMs: 7800,

  turnFindRounds: 6,
  turnFindWindowMs: 5500,

  followMinAcc: 0.42,
  smoothTol: 0.07,

  nextRoundDelayMs: 650,
  roundIntroDelayMs: 700,
  fallbackHoldMs: 3800,
} as const;
