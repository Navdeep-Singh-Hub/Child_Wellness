/** Pacing — OT Level 10 Session 8 · Game 1 Find Another Way */
export const FIND_ANOTHER_WAY_PACING = {
  rounds: 5,
  calibrationMs: 2800,
  tickMs: 80,
  tryHoldMs: 1200,
  tryGraceMs: 400,
  adaptHoldMs: 1700,
  adaptGraceMs: 400,
  minPostureForAdapt: 0.34,
  minAttentionForAdapt: 0.36,
  betweenRoundsMs: 1100,
  roundIntroMs: 800,
  fallbackTryMs: 2000,
  fallbackAdaptMs: 2500,
  starEveryNRounds: 2,
} as const;
