/** Pacing — OT Level 10 Session 9 · Game 5 Community Explorer */
export const COMMUNITY_EXPLORER_PACING = {
  rounds: 5,
  calibrationMs: 2800,
  tickMs: 80,
  visitHoldMs: 1200,
  visitGraceMs: 400,
  joinHoldMs: 1700,
  joinGraceMs: 400,
  minPostureForJoin: 0.34,
  minAttentionForJoin: 0.36,
  betweenRoundsMs: 1100,
  roundIntroMs: 800,
  fallbackVisitMs: 2000,
  fallbackJoinMs: 2500,
  starEveryNRounds: 2,
} as const;
