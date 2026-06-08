/**
 * Pacing constants for OT Level 3 Session 4 (up-down gestures).
 */

export const SESSION4_PACING = {
  rounds: 10,
  swipeThreshold: 80,
  objectStartUpPct: 20,
  objectStartDownPct: 75,
  objectEndUpPct: 15,
  objectEndDownPct: 80,
  elevatorTopPct: 18,
  elevatorGroundPct: 72,
  rainDropCount: 5,
  rainDropIntervalMs: 700,
  nextRoundDelayMs: 420,
  roundStartDelayMs: 500,
} as const;
