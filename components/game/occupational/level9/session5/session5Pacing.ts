/** Pacing — OT Level 9 Session 5 · Resistance Control */
export const SESSION9_5_PACING = {
  rounds: 8,
  calibrationMs: 2800,
  tickMs: 80,
  holdGraceMs: 350,
  betweenRoundsMs: 1100,
  roundIntroMs: 700,
  maxGameMs: 8 * 60 * 1000,
  starEveryNRounds: 2,
  /** Launch Power — per-round ignition resistance targets (0..1). */
  launchTargets: [0.4, 0.46, 0.52, 0.58, 0.64, 0.7, 0.76, 0.82] as const,
  launchBandHalf: 0.05,
  launchPreviewMs: 1500,
  launchHoldMs: 1700,
  launchBlastMs: 1250,
  fallbackLaunchMs: 3200,
  /** Minimum squat launch-pad + upward ignition pose form. */
  launchFormMin: 0.5,
  /** Pull The Ship — per-round tow resistance targets (0..1). */
  pullTargets: [0.39, 0.45, 0.51, 0.57, 0.63, 0.69, 0.75, 0.81] as const,
  pullBandHalf: 0.05,
  pullPreviewMs: 1480,
  pullHoldMs: 1720,
  pullDockMs: 1200,
  fallbackPullMs: 3180,
  /** Minimum anchor stance + waist rope-pull pose form. */
  pullFormMin: 0.5,
  /** Tug Challenge — per-round lateral tug resistance targets (0..1). */
  tugTargets: [0.41, 0.47, 0.53, 0.59, 0.65, 0.71, 0.77, 0.83] as const,
  tugBandHalf: 0.05,
  tugPreviewMs: 1470,
  tugHoldMs: 1740,
  tugWinMs: 1220,
  fallbackTugMs: 3190,
  /** Minimum tug battle stance + outward chest rope pose form. */
  tugFormMin: 0.5,
  /** Volcano Push — per-round lava vent resistance targets (0..1). */
  volcanoTargets: [0.42, 0.48, 0.54, 0.6, 0.66, 0.72, 0.78, 0.84] as const,
  volcanoBandHalf: 0.05,
  volcanoPreviewMs: 1490,
  volcanoHoldMs: 1750,
  volcanoContainMs: 1240,
  fallbackVolcanoMs: 3200,
  /** Minimum crater stance + downward vent push pose form. */
  volcanoFormMin: 0.5,
  /** Strength Master — per-round overhead pillar resistance targets (0..1). */
  strengthTargets: [0.43, 0.49, 0.55, 0.61, 0.67, 0.73, 0.79, 0.85] as const,
  strengthBandHalf: 0.05,
  strengthPreviewMs: 1510,
  strengthHoldMs: 1760,
  strengthCrownMs: 1260,
  fallbackStrengthMs: 3210,
  /** Minimum colosseum stance + overhead pillar hold pose form. */
  strengthFormMin: 0.5,
} as const;
