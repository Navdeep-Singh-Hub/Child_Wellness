/** Pacing — OT Level 10 Session 6 · Game 2 Stop & Think */
export const STOP_THINK_PACING = {
  rounds: 5,
  calibrationMs: 2800,
  tickMs: 80,
  goHoldMs: 1100,
  goGraceMs: 400,
  stopHoldMs: 1800,
  stopGraceMs: 450,
  minPostureForStop: 0.34,
  minAttentionForStop: 0.34,
  minStillnessForStop: 0.38,
  betweenRoundsMs: 1100,
  roundIntroMs: 800,
  fallbackGoMs: 1800,
  fallbackStopMs: 2600,
  starEveryNRounds: 2,
} as const;
