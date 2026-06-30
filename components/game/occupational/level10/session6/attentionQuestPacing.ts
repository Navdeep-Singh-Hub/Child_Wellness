/** Pacing — OT Level 10 Session 6 · Game 3 Attention Quest */
export const ATTENTION_QUEST_PACING = {
  rounds: 5,
  calibrationMs: 2800,
  tickMs: 80,
  trailHoldMs: 1250,
  trailGraceMs: 400,
  questHoldMs: 1650,
  questGraceMs: 400,
  minPostureForQuest: 0.34,
  minAttentionForQuest: 0.36,
  betweenRoundsMs: 1100,
  roundIntroMs: 800,
  fallbackTrailMs: 2000,
  fallbackQuestMs: 2500,
  starEveryNRounds: 2,
} as const;
