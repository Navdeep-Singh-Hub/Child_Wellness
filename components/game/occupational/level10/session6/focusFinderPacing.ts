/** Pacing — OT Level 10 Session 6 · Game 1 Focus Finder */
export const FOCUS_FINDER_PACING = {
  rounds: 5,
  calibrationMs: 2800,
  tickMs: 80,
  seekHoldMs: 1200,
  seekGraceMs: 400,
  focusHoldMs: 1700,
  focusGraceMs: 400,
  minPostureForFocus: 0.34,
  minAttentionForFocus: 0.36,
  betweenRoundsMs: 1100,
  roundIntroMs: 800,
  fallbackSeekMs: 2000,
  fallbackFocusMs: 2500,
  starEveryNRounds: 2,
} as const;
