/** Pacing — OT Level 10 Session 10 · Game 2 Space Explorer */
export const SPACE_EXPLORER_PACING = {
  rounds: 5,
  calibrationMs: 2800,
  tickMs: 80,
  scanHoldMs: 1200,
  scanGraceMs: 400,
  flyHoldMs: 1700,
  flyGraceMs: 400,
  minPostureForFly: 0.34,
  minAttentionForFly: 0.36,
  betweenRoundsMs: 1100,
  roundIntroMs: 800,
  fallbackScanMs: 2000,
  fallbackFlyMs: 2500,
  starEveryNRounds: 2,
} as const;
