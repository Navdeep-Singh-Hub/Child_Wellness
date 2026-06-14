/**
 * Pacing & scoring constants for OT Level 7 Session 1 — Linear Vestibular Movement.
 */

export const SESSION1_PACING = {
  calibrationMs: 3000,
  tickMs: 110,

  // Step detection (alternating leg lift + motion-burst fallback).
  marchLiftAmount: 0.36,
  marchRefractoryMs: 400,
  motionRepHigh: 0.08,
  motionRepLow: 0.038,

  // Quality gates to credit a step.
  balanceMin: 0.42,
  alignmentMin: 0.38,

  // Movement intensity ceiling for energy / power meters.
  intensityCeiling: 0.15,

  // Wave Walker: balance threshold oscillates with visual waves.
  waveCycleMs: 3200,
  waveBalanceSwing: 0.12,

  maxGameMs: 80000,
  nextStepDelayMs: 280,
  fallbackStepMs: 1400,
  starEveryNSteps: 2,
} as const;
