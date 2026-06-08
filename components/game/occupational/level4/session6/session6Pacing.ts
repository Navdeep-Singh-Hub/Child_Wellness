/**
 * Pacing constants for OT Level 4 Session 6 (pass ball across midline).
 */

export const SESSION4_6_PACING = {
  rounds: 10,
  nextRoundDelayMs: 420,
  roundStartDelayMs: 400,
  passAnimMs: 420,
  throwDurationMs: 900,
  catchWindowMs: 2000,
  rhythmBeatMs: 1500,
  rhythmPassesPerRound: 4,
  handPassesPerRound: 2,
  matchTolerancePx: 58,
  obstacleRadiusPx: 60,
  leftXPct: 0.25,
  rightXPct: 0.75,
  ballYPct: 0.5,
  throwYPct: 0.42,
  ballStartXPct: 0.18,
  ballStartYPct: 0.72,
} as const;
