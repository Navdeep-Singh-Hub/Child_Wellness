/**
 * Pacing constants for OT Level 1 Session 9 (shrinking targets).
 */

export const SESSION9_PACING = {
  nextRoundDelayMs: 420,
  retryDelayMs: 500,
  successPopMs: 260,
  shrinkCircle: { initial: 210, min: 24, durationMs: 5500 },
  shrinkStop: { initial: 190, min: 58, shrinkMs: 4800, stopMs: 900 },
  starSmallest: { initial: 170, min: 48, durationMs: 5000 },
  multiTarget: { initial: 110, min: 38, fastMs: 3800, mediumMs: 4800, slowMs: 5800, glowStopMs: 450 },
  moveShrink: { initial: 76, min: 28, shrinkMs: 5500, speedPxPerSec: 48 },
} as const;
