/**
 * Pacing constants for OT Level 4 Session 8 (tap alternating sides).
 */

export const SESSION4_8_PACING = {
  lightsRounds: 12,
  soundRounds: 12,
  countRounds: 10,
  fastRounds: 15,
  pingPongRounds: 8,
  nextRoundDelayMs: 500,
  roundStartDelayMs: 500,
  lightsTimeoutMs: 3000,
  soundTimeoutMs: 3000,
  countTimeoutMs: 4000,
  fastInitialMs: 1500,
  fastMinMs: 600,
  fastDecreaseMs: 100,
  pingPongDurationMs: 2400,
  pingPongCenterWindowMs: 750,
  pingPongCenterTolerancePct: 0.28,
  pulseHalfMs: 450,
} as const;
