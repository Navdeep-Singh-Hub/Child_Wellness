/** Pacing — OT Level 10 Session 4 · Game 3 Catch & Turn */
export const CATCH_TURN_PACING = {
  rounds: 5,
  calibrationMs: 2800,
  tickMs: 80,
  catchFlightMs: 2400,
  catchWindowStart: 0.68,
  catchHoldMs: 1400,
  catchGraceMs: 400,
  turnHoldMs: 1500,
  turnGraceMs: 400,
  betweenRoundsMs: 1100,
  roundIntroMs: 800,
  fallbackCatchMs: 2200,
  fallbackTurnMs: 2400,
  starEveryNRounds: 2,
} as const;
