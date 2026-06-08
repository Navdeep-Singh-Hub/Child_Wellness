/**
 * Pacing constants for OT Level 1 Session 4 (sustained hold / graded force).
 */

export const SESSION4_PACING = {
  holdButton: {
    holdDurationMs: 1800,
    perfectThreshold: 0.95,
    breakThreshold: 0.3,
    nextRoundDelayMs: 420,
    breakResetMs: 900,
  },
  growBalloon: {
    inflateDurationMs: 2000,
    minSizeForReward: 0.7,
    floatDurationMs: 1300,
    nextRoundDelayMs: 380,
  },
  launchRocket: {
    fuelDurationMs: 2000,
    perfectThreshold: 0.95,
    launchDurationMs: 1300,
    nextRoundDelayMs: 420,
  },
  squishJelly: {
    compressDurationMs: 1000,
    maxCompression: 0.5,
    splatThreshold: 0.3,
    goodMin: 0.5,
    goodMax: 0.72,
    splatResetMs: 1200,
    nextRoundDelayMs: 380,
  },
  holdLight: {
    holdDurationMs: 1800,
    perfectWindowStart: 0.9,
    nextRoundDelayMs: 420,
  },
} as const;
