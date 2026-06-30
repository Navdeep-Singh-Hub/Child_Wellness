/**
 * Pacing constants for OT Level 4 Session 1 (drag left → right).
 */

export const SESSION4_1_PACING = {
  rounds: 10,
  nextRoundDelayMs: 420,
  roundStartDelayMs: 400,
  matchTolerancePx: 58,
  timedLimitMs: 5000,
  timedTickMs: 100,
  startXPct: 0.2,
  targetXPct: 0.8,
  objectYPct: 0.5,
  monsterTargetYPct: 0.52,
} as const;
