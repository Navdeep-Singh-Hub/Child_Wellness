/**
 * Pacing constants for OT Level 3 Session 10 (posture-based games).
 */

export const SESSION10_PACING = {
  confirmRounds: 10,
  holdRounds: 8,
  nextRoundDelayMs: 420,
  roundStartDelayMs: 500,
  poseShowMs: 2800,
  confirmWindowMs: 4800,
  holdPoseShowMs: 1800,
  holdDurationMs: 5000,
  holdTickMs: 100,
  countIntervalMs: 1000,
} as const;
