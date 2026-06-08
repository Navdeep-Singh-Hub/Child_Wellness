/**
 * Pacing constants for OT Level 4 Session 3 (diagonal dragging).
 */

export const SESSION4_3_PACING = {
  rounds: 10,
  nextRoundDelayMs: 420,
  roundStartDelayMs: 400,
  matchTolerancePx: 58,
  pathTolerancePx: 55,
  startXPct: 0.15,
  startYPct: 0.18,
  endXPct: 0.85,
  endYPct: 0.82,
  zigzagStartYPct: 0.22,
  zigzagEndYPct: 0.78,
  xPathOffsetPct: 0.28,
  catchFallSpeed: 2.5,
  catchTolerancePx: 65,
} as const;
