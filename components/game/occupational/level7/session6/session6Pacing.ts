/**
 * Pacing & scoring constants for OT Level 7 Session 6 — Visual-Vestibular Integration.
 */

export const SESSION6_PACING = {
  calibrationMs: 3000,
  tickMs: 100,

  trackTolerance: 0.2,
  followMinAcc: 0.4,
  smoothTol: 0.07,

  rocketRounds: 4,
  butterflyRounds: 4,
  balloonRounds: 4,
  ufoRounds: 5,
  orbitRounds: 5,

  followRoundMs: 8200,

  nextRoundDelayMs: 650,
  roundIntroDelayMs: 700,
} as const;
