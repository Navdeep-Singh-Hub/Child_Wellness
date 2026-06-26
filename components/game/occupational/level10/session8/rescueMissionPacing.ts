/** Pacing — OT Level 10 Session 8 · Game 4 Rescue Mission */
export const RESCUE_MISSION_PACING = {
  rounds: 5,
  calibrationMs: 2800,
  tickMs: 80,
  spotHoldMs: 1200,
  spotGraceMs: 400,
  rescueHoldMs: 1700,
  rescueGraceMs: 400,
  minPostureForRescue: 0.34,
  minAttentionForRescue: 0.36,
  betweenRoundsMs: 1100,
  roundIntroMs: 800,
  fallbackSpotMs: 2000,
  fallbackRescueMs: 2500,
  starEveryNRounds: 2,
} as const;
