/**
 * Pacing constants for OT Level 3 Session 5 (left-right swipes).
 */

export const SESSION5_PACING = {
  rounds: 10,
  swipeThreshold: 80,
  objectCenterPct: 50,
  objectLeftPct: 18,
  objectRightPct: 82,
  ballTopPct: 18,
  ballCatchPct: 62,
  ballFallMs: 2200,
  nextRoundDelayMs: 420,
  roundStartDelayMs: 500,
} as const;
