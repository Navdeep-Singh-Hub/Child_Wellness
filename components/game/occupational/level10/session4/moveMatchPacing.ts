/** Pacing — OT Level 10 Session 4 · Game 4 Move & Match */
export const MOVE_MATCH_PACING = {
  rounds: 5,
  calibrationMs: 2800,
  tickMs: 80,
  moveHoldMs: 1400,
  moveGraceMs: 400,
  matchRevealMs: 500,
  matchHoldMs: 1500,
  matchGraceMs: 400,
  betweenRoundsMs: 1100,
  roundIntroMs: 800,
  fallbackMoveMs: 2000,
  fallbackMatchMs: 2400,
  starEveryNRounds: 2,
} as const;
