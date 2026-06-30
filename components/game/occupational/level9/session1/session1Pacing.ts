/** Pacing — OT Level 9 Session 1 · Force Awareness */
export const SESSION9_1_PACING = {
  rounds: 8,
  calibrationMs: 2800,
  tickMs: 80,
  holdToConfirmMs: 1400,
  holdGraceMs: 350,
  betweenRoundsMs: 1100,
  roundIntroMs: 700,
  maxGameMs: 8 * 60 * 1000,
  fallbackPressMs: 2200,
  /** Per-round target force (0..1) — gentle → firm. */
  targetForces: [0.42, 0.48, 0.54, 0.6, 0.66, 0.72, 0.78, 0.84] as const,
  starEveryNRounds: 2,
  /** Rocket Push — forward bilateral thrust targets (0..1). */
  rocketTargetForces: [0.38, 0.45, 0.52, 0.58, 0.65, 0.72, 0.78, 0.85] as const,
  rocketHoldMs: 1200,
  rocketLaunchMs: 900,
  fallbackPushMs: 2400,
  /** Berry Squish — bilateral squeeze targets (0..1). */
  berryTargetForces: [0.4, 0.46, 0.52, 0.58, 0.64, 0.7, 0.76, 0.82] as const,
  berrySquishHoldMs: 1250,
  berrySquishAnimMs: 850,
  fallbackSquishMs: 2500,
  /** Energy Meter — target zone centers (0..1). */
  energyTargets: [0.35, 0.42, 0.48, 0.55, 0.62, 0.68, 0.74, 0.8] as const,
  energyBandHalf: 0.045,
  energyHoldMs: 1500,
  energySurgeMs: 900,
  fallbackChargeMs: 2600,
  /** Match The Force — per-round target levels (0..1), varied for grading practice. */
  matchTargets: [0.32, 0.58, 0.42, 0.68, 0.5, 0.74, 0.46, 0.78] as const,
  matchTolerance: 0.04,
  matchPreviewMs: 1200,
  matchHoldMs: 1300,
  matchSyncMs: 800,
  fallbackMatchMs: 2500,
} as const;
