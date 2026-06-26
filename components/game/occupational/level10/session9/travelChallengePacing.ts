/** Pacing — OT Level 10 Session 9 · Game 4 Travel Challenge */
export const TRAVEL_CHALLENGE_PACING = {
  rounds: 5,
  calibrationMs: 2800,
  tickMs: 80,
  packHoldMs: 1200,
  packGraceMs: 400,
  travelHoldMs: 1700,
  travelGraceMs: 400,
  minPostureForTravel: 0.34,
  minAttentionForTravel: 0.36,
  betweenRoundsMs: 1100,
  roundIntroMs: 800,
  fallbackPackMs: 2000,
  fallbackTravelMs: 2500,
  starEveryNRounds: 2,
} as const;
