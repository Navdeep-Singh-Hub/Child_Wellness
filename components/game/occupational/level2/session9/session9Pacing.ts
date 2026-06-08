/**
 * Pacing constants for OT Level 2 Session 9 (copy simple patterns games).
 */

export const SESSION9_PACING = {
  totalRounds: 6,
  nextRoundDelayMs: 420,
  retryDelayMs: 400,
  showDurationMs: 3000,
  hideDurationMs: 2000,
  blockSize: 8,
  colorCellSize: 14,
} as const;
