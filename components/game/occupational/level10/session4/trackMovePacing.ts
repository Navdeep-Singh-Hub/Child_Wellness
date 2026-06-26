/** Pacing — OT Level 10 Session 4 · Game 2 Track & Move */
export const TRACK_MOVE_PACING = {
  rounds: 5,
  calibrationMs: 2800,
  tickMs: 80,
  trackDurationMs: 2800,
  trackRequiredMs: 1600,
  trackGraceMs: 350,
  moveHoldMs: 1500,
  moveGraceMs: 400,
  betweenRoundsMs: 1100,
  roundIntroMs: 800,
  fallbackTrackMs: 2600,
  fallbackMoveMs: 2400,
  starEveryNRounds: 2,
} as const;
