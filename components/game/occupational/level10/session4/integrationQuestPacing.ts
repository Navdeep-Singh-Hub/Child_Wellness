/** Pacing — OT Level 10 Session 4 · Game 5 Integration Quest */
export const INTEGRATION_QUEST_PACING = {
  rounds: 5,
  calibrationMs: 3000,
  tickMs: 80,
  gatherHoldMs: 1200,
  gatherGraceMs: 400,
  integrateHoldMs: 1600,
  integrateGraceMs: 400,
  completeHoldMs: 1500,
  completeGraceMs: 400,
  betweenRoundsMs: 1200,
  roundIntroMs: 900,
  fallbackGatherMs: 1800,
  fallbackIntegrateMs: 2200,
  fallbackCompleteMs: 2400,
  starEveryNRounds: 2,
} as const;
