/** Pacing — OT Level 10 Session 5 · Game 3 Meal Mission */
export const MEAL_MISSION_PACING = {
  rounds: 5,
  calibrationMs: 2800,
  tickMs: 80,
  prepareHoldMs: 1300,
  prepareGraceMs: 400,
  readyHoldMs: 1600,
  readyGraceMs: 400,
  minPostureForReady: 0.34,
  betweenRoundsMs: 1100,
  roundIntroMs: 800,
  fallbackPrepareMs: 2000,
  fallbackReadyMs: 2400,
  starEveryNRounds: 2,
} as const;
