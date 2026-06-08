/**
 * Pacing constants for OT Level 1 Session 6 (sequencing / memory).
 */

export const SESSION6_PACING = {
  nextRoundDelayMs: 400,
  sequenceStepMs: 850,
  sequenceStartDelayMs: 320,
  shakeResetMs: 420,
  replayDelayMs: 380,
  numbers: {
    circleSize: 96,
    sequenceLength: 3,
  },
  colors: {
    size: 96,
    sequenceLength: 3,
  },
  arrows: {
    size: 88,
    startLength: 2,
    maxLength: 3,
  },
  lights: {
    size: 96,
    startLength: 2,
    maxLength: 3,
  },
} as const;
