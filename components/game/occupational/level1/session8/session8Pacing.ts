/**
 * Pacing constants for OT Level 1 Session 8 (precision targeting).
 */

export const SESSION8_PACING = {
  nextRoundDelayMs: 400,
  successPopMs: 260,
  shakeResetMs: 400,
  hintDelayMs: 2800,
  dotAppearMs: 220,
  zonePulseMs: 500,
  tinyDot: { size: 22, hitPad: 36 },
  centerTarget: { outer: 190, center: 48, centerHit: 100 },
  movingTarget: { size: 38, zoneWidth: 110, speedPxPerSec: 55 },
  smallestShape: { sizes: [58, 88, 118, 148] as const },
  hiddenObject: { size: 22, patternDot: 7, hitPad: 44 },
} as const;
