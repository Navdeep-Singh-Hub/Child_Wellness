/**
 * Pacing constants for OT Level 1 Session 10 (pinch & two-finger coordination).
 */

export const SESSION10_PACING = {
  nextRoundDelayMs: 420,
  retryResetMs: 500,
  successPopMs: 260,
  pinchPop: { balloonSize: 148, pinchThreshold: 0.32 },
  pinchResize: { min: 58, max: 240, tolerance: 22 },
  treasure: { chestSize: 190, lockSize: 72, pinchThreshold: 0.32 },
  twinTap: { targetSize: 118, maxTapDelayMs: 380 },
} as const;
