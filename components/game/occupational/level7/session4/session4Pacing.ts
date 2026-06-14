/**
 * Pacing & scoring constants for OT Level 7 Session 4 — Rotational Processing.
 */

export const SESSION4_PACING = {
  calibrationMs: 3000,
  tickMs: 100,

  turn90Min: 0.28,
  turn180Min: 0.5,
  balanceThreshold: 0.42,
  stopStillMin: 0.58,
  spinMotionMin: 0.045,

  turnDwellMs: 900,
  stopDwellMs: 1100,
  spinDwellMs: 800,
  orbitDwellMs: 850,
  pointDwellMs: 2000,
  turnPhaseDwellMs: 750,

  spinPhaseMs: 2800,
  spinStopCount: 6,

  actionWindowMs: 6500,
  spinStopWindowMs: 7000,

  nextRoundDelayMs: 650,
  roundIntroDelayMs: 700,
  pointTol: 0.21,
} as const;
