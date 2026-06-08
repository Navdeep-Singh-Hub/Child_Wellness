/**
 * Pacing constants for OT Level 3 Session 9 (mirror movements).
 */

export const SESSION9_PACING = {
  rounds: 10,
  nextRoundDelayMs: 420,
  roundStartDelayMs: 500,
  poseShowMs: 2800,
  handShowMs: 2200,
  delayedShowMs: 1800,
  delayedWaitMs: 2000,
  fastPoseMs: 1200,
  fastPosesPerRound: 3,
  patternStepMs: 900,
  patternLength: 3,
} as const;
