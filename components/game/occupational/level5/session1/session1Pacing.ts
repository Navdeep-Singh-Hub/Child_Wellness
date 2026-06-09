/**
 * Pacing constants for OT Level 5 Session 1 (follow moving object).
 */

export const SESSION5_1_PACING = {
  rounds: 10,
  nextRoundDelayMs: 420,
  roundStartDelayMs: 400,
  tapTolerancePx: 50,
  targetHalfPx: 32,
  followDistancePx: 100,
  followHoldMs: 3000,
  bombCount: 3,
  bombHalfPx: 26,
  targetHalfBombPx: 30,
  bounceSpeedMin: 1.5,
  bounceSpeedMax: 2.5,
  erraticSpeedMin: 1.5,
  erraticSpeedMax: 3,
  erraticChangeMinMs: 1000,
  erraticChangeMaxMs: 2000,
  zigzagSpeedPx: 3,
  zigzagAmplitudePx: 150,
  zigzagFrequency: 0.01,
  jitterTargetPx: 2,
  jitterBombPx: 3,
  moveTickMs: 16,
  bombJitterMs: 50,
  xpPerScore: 15,
} as const;
