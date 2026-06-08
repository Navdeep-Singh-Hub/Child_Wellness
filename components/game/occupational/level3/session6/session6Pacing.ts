/**
 * Pacing constants for OT Level 3 Session 6 (jump imitation / tap twice).
 */

export const SESSION6_PACING = {
  rounds: 10,
  doubleTapMaxMs: 600,
  strictDoubleTapMaxMs: 500,
  beatIntervalMs: 600,
  rhythmToleranceMs: 300,
  rhythmTapWindowMs: 1800,
  numberShowMs: 2000,
  numberDelayMs: 800,
  obstacleCrossMs: 2200,
  jumpUpPct: 32,
  jumpDownPct: 68,
  nextRoundDelayMs: 420,
  roundStartDelayMs: 500,
} as const;
