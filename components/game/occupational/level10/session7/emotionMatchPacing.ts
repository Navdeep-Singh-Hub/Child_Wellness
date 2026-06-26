/** Pacing — OT Level 10 Session 7 · Game 2 Emotion Match */
export const EMOTION_MATCH_PACING = {
  rounds: 5,
  calibrationMs: 2800,
  tickMs: 80,
  findHoldMs: 1200,
  findGraceMs: 400,
  matchHoldMs: 1700,
  matchGraceMs: 400,
  minPostureForMatch: 0.34,
  minAttentionForMatch: 0.36,
  betweenRoundsMs: 1100,
  roundIntroMs: 800,
  fallbackFindMs: 2000,
  fallbackMatchMs: 2500,
  starEveryNRounds: 2,
} as const;
