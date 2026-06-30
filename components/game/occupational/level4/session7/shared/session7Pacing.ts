/**
 * Pacing constants for OT Level 4 Session 7 (follow cross-body arrows).
 */

export const SESSION4_7_PACING = {
  tapRounds: 10,
  swipeRounds: 10,
  movingRounds: 10,
  sequenceRounds: 8,
  speedRounds: 8,
  nextRoundDelayMs: 420,
  roundStartDelayMs: 400,
  arrowRevealMs: 300,
  sequenceLength: 3,
  sequenceStepMs: 700,
  sequenceRevealGapMs: 450,
  moveDurationMs: 2800,
  swipeThresholdPx: 90,
  speedInitialMs: 3500,
  speedMinMs: 2200,
  speedDecreaseMs: 80,
} as const;
