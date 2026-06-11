/**
 * Pacing constants for OT Level 4 Session 9 (two-hand drag).
 */

export const SESSION4_9_PACING = {
  rounds: 8,
  nextRoundDelayMs: 420,
  roundStartDelayMs: 400,
  matchTolerancePx: 62,
  sortTolerancePx: 68,
  pullThresholdPx: 100,
  balanceTargetYPct: 0.72,
  balanceTolerancePx: 90,
  balanceSpeedTolerance: 22,
  objHalfPx: 38,
} as const;
