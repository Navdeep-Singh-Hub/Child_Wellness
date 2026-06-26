/** Pacing — OT Level 10 Session 10 · Game 1 Jungle Expedition */
export const JUNGLE_EXPEDITION_PACING = {
  rounds: 5,
  calibrationMs: 2800,
  tickMs: 80,
  scoutHoldMs: 1200,
  scoutGraceMs: 400,
  trekHoldMs: 1700,
  trekGraceMs: 400,
  minPostureForTrek: 0.34,
  minAttentionForTrek: 0.36,
  betweenRoundsMs: 1100,
  roundIntroMs: 800,
  fallbackScoutMs: 2000,
  fallbackTrekMs: 2500,
  starEveryNRounds: 2,
} as const;
