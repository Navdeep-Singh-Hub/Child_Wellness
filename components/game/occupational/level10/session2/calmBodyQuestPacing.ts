/** Pacing — OT Level 10 Session 2 · Game 4 Calm Body Quest */
export const CALM_BODY_QUEST_PACING = {
  sanctuaries: 5,
  calibrationMs: 2800,
  tickMs: 80,
  briefingMs: 1500,
  holdCalmMs: 2500,
  holdGraceMs: 400,
  betweenSanctuariesMs: 1000,
  roundIntroMs: 800,
  fallbackCalmMs: 3000,
  starEveryN: 2,
  /** Max motion per tick to count as still during calm hold. */
  maxStillMotionNorm: 0.018,
  /** Motion above this resets calm hold faster. */
  restlessMotionNorm: 0.038,
} as const;
