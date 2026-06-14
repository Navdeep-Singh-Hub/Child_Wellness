/**
 * Pacing & scoring constants for OT Level 6 Session 6 — Dynamic Balance.
 */

export const SESSION6_PACING = {
  calibrationMs: 3000,
  tickMs: 110,

  // Lateral shift to register a step (shoulder-widths).
  stepTolerance: 0.24,
  // Body-turn proxy threshold (0..1).
  turnThreshold: 0.4,
  // Balance quality to count a frame as controlled.
  balanceThreshold: 0.45,
  // Stillness threshold for "stop" actions.
  stopStillThreshold: 0.6,
  // Motion magnitude that counts as active "march/go".
  marchMotionMin: 0.05,

  // Per-action hold/dwell requirements (ms).
  stepLandMs: 600, // reach the stone + steady to count a step
  steadyHoldMs: 1100, // careful heel-to-toe step (Cross The Bridge)
  turnHoldMs: 700,
  stopHoldMs: 1200,
  goHoldMs: 1200,

  // Per-action time window before it's marked missed (ms).
  actionWindowMs: 7000,

  // Sequence lengths.
  steppingStonesCount: 6,
  crossBridgeSteps: 6,
  riverCrossings: 6,

  nextRoundDelayMs: 650,
  roundIntroDelayMs: 800,
  fallbackActionMs: 1500,
} as const;
