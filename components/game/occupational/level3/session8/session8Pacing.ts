/**
 * Pacing constants for OT Level 3 Session 8 (whole body map).
 */

export const SESSION8_PACING = {
  rounds: 10,
  nextRoundDelayMs: 420,
  roundStartDelayMs: 500,
  highlightDelayMs: 400,
  pulseMs: 550,
  flashDurationMs: 750,
  flashResponseMs: 1400,
  flashesPerRound: 5,
  puzzleMatchPx: 52,
  nextRoundDelayLongMs: 650,
} as const;
