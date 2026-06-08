/**
 * Pacing constants for OT Level 4 Session 4 (two-hand tapping).
 */

export const SESSION4_4_PACING = {
  rounds: 10,
  nextRoundDelayMs: 420,
  roundStartDelayMs: 400,
  timedLimitMs: 3000,
  timedTickMs: 100,
  lightDurationMs: 2000,
  lightDelayMinMs: 1000,
  lightDelayMaxMs: 2800,
  holdDurationMs: 3000,
  holdTickMs: 100,
  targetTaps: 5,
} as const;
