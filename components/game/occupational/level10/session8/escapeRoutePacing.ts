/** Pacing — OT Level 10 Session 8 · Game 3 Escape Route */
export const ESCAPE_ROUTE_PACING = {
  rounds: 5,
  calibrationMs: 2800,
  tickMs: 80,
  scoutHoldMs: 1200,
  scoutGraceMs: 400,
  escapeHoldMs: 1700,
  escapeGraceMs: 400,
  minPostureForEscape: 0.34,
  minAttentionForEscape: 0.36,
  betweenRoundsMs: 1100,
  roundIntroMs: 800,
  fallbackScoutMs: 2000,
  fallbackEscapeMs: 2500,
  starEveryNRounds: 2,
} as const;
