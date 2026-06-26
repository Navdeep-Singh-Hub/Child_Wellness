/** Pacing — OT Level 9 Session 6 · Body Awareness */
export const SESSION9_6_PACING = {
  rounds: 8,
  calibrationMs: 2800,
  tickMs: 80,
  holdGraceMs: 350,
  betweenRoundsMs: 1100,
  roundIntroMs: 700,
  maxGameMs: 8 * 60 * 1000,
  starEveryNRounds: 2,
  /** Build The Body — per-round placement effort targets (0..1). */
  buildTargets: [0.4, 0.46, 0.52, 0.58, 0.64, 0.7, 0.76, 0.82] as const,
  buildBandHalf: 0.05,
  buildPreviewMs: 1520,
  buildHoldMs: 1680,
  buildSnapMs: 1180,
  fallbackBuildMs: 3100,
  /** Full-body segment match tolerance. */
  buildTolerance: 0.13,
  /** Minimum segment pose match before placement hold counts. */
  buildMatchMin: 0.5,
  /** Touch The Part — per-round controlled touch effort targets (0..1). */
  touchTargets: [0.39, 0.45, 0.51, 0.57, 0.63, 0.69, 0.75, 0.81] as const,
  touchBandHalf: 0.05,
  touchPreviewMs: 1480,
  touchHoldMs: 1620,
  touchGlowMs: 1160,
  fallbackTouchMs: 3050,
  /** Wrist-to-landmark proximity radius in shoulder-width units. */
  touchRadiusNorm: 0.4,
  /** Minimum touch proximity before hold counts. */
  touchProxMin: 0.52,
  /** Body Map — per-round zone mapping effort targets (0..1). */
  mapTargets: [0.41, 0.47, 0.53, 0.59, 0.65, 0.71, 0.77, 0.83] as const,
  mapBandHalf: 0.05,
  mapPreviewMs: 1530,
  mapHoldMs: 1700,
  mapIlluminateMs: 1200,
  fallbackMapMs: 3120,
  /** Minimum regional zone activation before mapping hold counts. */
  mapZoneMin: 0.5,
  /** Hero Pose — per-round heroic power effort targets (0..1). */
  heroTargets: [0.42, 0.48, 0.54, 0.6, 0.66, 0.72, 0.78, 0.84] as const,
  heroBandHalf: 0.05,
  heroPreviewMs: 1540,
  heroHoldMs: 1720,
  heroUnleashMs: 1220,
  fallbackHeroMs: 3140,
  /** Full-body hero pose match tolerance. */
  heroTolerance: 0.13,
  /** Minimum hero pose match before power hold counts. */
  heroFormMin: 0.5,
  /** Robot Builder — per-round assembly torque targets (0..1). */
  robotTargets: [0.43, 0.49, 0.55, 0.61, 0.67, 0.73, 0.79, 0.85] as const,
  robotBandHalf: 0.05,
  robotPreviewMs: 1550,
  robotHoldMs: 1730,
  robotActivateMs: 1240,
  fallbackRobotMs: 3160,
  /** Tighter mechanical joint match tolerance. */
  robotTolerance: 0.12,
  /** Minimum module pose match before torque hold counts. */
  robotFormMin: 0.52,
} as const;
