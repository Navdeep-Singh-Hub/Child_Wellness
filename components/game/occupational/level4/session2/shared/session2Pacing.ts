/**
 * Pacing constants for OT Level 4 Session 2 (drag right → left).
 */

export const SESSION4_2_PACING = {
  rounds: 10,
  nextRoundDelayMs: 420,
  roundStartDelayMs: 400,
  matchTolerancePx: 58,
  pathTolerancePx: 50,
  pathProgressMinPct: 80,
  startXPct: 0.8,
  targetXPct: 0.2,
  objectYPct: 0.5,
} as const;
