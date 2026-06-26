/** Pacing — OT Level 10 Session 9 · Game 3 Playground Quest */
export const PLAYGROUND_QUEST_PACING = {
  rounds: 5,
  calibrationMs: 2800,
  tickMs: 80,
  exploreHoldMs: 1200,
  exploreGraceMs: 400,
  playHoldMs: 1700,
  playGraceMs: 400,
  minPostureForPlay: 0.34,
  minAttentionForPlay: 0.36,
  betweenRoundsMs: 1100,
  roundIntroMs: 800,
  fallbackExploreMs: 2000,
  fallbackPlayMs: 2500,
  starEveryNRounds: 2,
} as const;
