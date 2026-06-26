/** Pacing — OT Level 9 Session 4 · Heavy Work Missions */
export const SESSION9_4_PACING = {
  rounds: 8,
  calibrationMs: 2800,
  tickMs: 80,
  holdGraceMs: 350,
  betweenRoundsMs: 1100,
  roundIntroMs: 700,
  maxGameMs: 8 * 60 * 1000,
  starEveryNRounds: 2,
  /** Carry The Treasure — per-round carry effort targets (treasure weight 0..1). */
  carryTargets: [0.38, 0.44, 0.5, 0.56, 0.62, 0.68, 0.74, 0.8] as const,
  carryBandHalf: 0.05,
  carryPreviewMs: 1400,
  carryHoldMs: 1650,
  carryDeliverMs: 1100,
  fallbackCarryMs: 3000,
  /** Minimum carry pose form to count effort (elbow bend + wrist height). */
  carryFormMin: 0.52,
  /** Wall Pusher — per-round push effort targets (wall resistance 0..1). */
  pushTargets: [0.4, 0.46, 0.52, 0.58, 0.64, 0.7, 0.76, 0.82] as const,
  pushBandHalf: 0.05,
  pushPreviewMs: 1450,
  pushHoldMs: 1600,
  pushBreachMs: 1120,
  fallbackWallPushMs: 3100,
  /** Minimum wall-push pose form (extended arms + chest-height palms). */
  wallFormMin: 0.5,
  /** Gorilla Power — per-round chest-beat power targets (0..1). */
  gorillaTargets: [0.42, 0.48, 0.54, 0.6, 0.66, 0.72, 0.78, 0.84] as const,
  gorillaBandHalf: 0.05,
  gorillaPreviewMs: 1500,
  gorillaHoldMs: 1650,
  gorillaRoarMs: 1150,
  fallbackGorillaMs: 3200,
  /** Minimum gorilla power pose form (raised arms + power stance). */
  gorillaFormMin: 0.5,
  /** Train Engine — per-round steam chug targets (0..1). */
  trainTargets: [0.41, 0.47, 0.53, 0.59, 0.65, 0.71, 0.77, 0.83] as const,
  trainBandHalf: 0.05,
  trainPreviewMs: 1450,
  trainHoldMs: 1620,
  trainDepartMs: 1180,
  fallbackTrainMs: 3150,
  /** Minimum engineer lever pose form. */
  trainFormMin: 0.5,
  /** Bulldozer Mission — per-round blade push targets (0..1). */
  bulldozerTargets: [0.43, 0.49, 0.55, 0.61, 0.67, 0.73, 0.79, 0.85] as const,
  bulldozerBandHalf: 0.05,
  bulldozerPreviewMs: 1480,
  bulldozerHoldMs: 1680,
  bulldozerClearMs: 1200,
  fallbackBulldozerMs: 3180,
  /** Minimum bulldozer blade pose form (low push + wide stance). */
  bulldozerFormMin: 0.5,
} as const;
