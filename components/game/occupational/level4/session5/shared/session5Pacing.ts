/**
 * Pacing constants for OT Level 4 Session 5 (alternating hands).
 */

export const SESSION4_5_PACING = {
  rounds: 10,
  nextRoundDelayMs: 420,
  roundStartDelayMs: 400,
  sequenceSteps: 5,
  walkingSteps: 4,
  beatSteps: 4,
  speedSteps: 6,
  flashDurationMs: 1500,
  flashTickMs: 100,
  flashRetryDelayMs: 1200,
  beatCueDelayMs: 400,
  speedInitialMs: 2000,
  speedFinalMs: 800,
  speedStepGapMs: 280,
} as const;
