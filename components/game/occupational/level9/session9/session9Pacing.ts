/** Pacing — OT Level 9 Session 9 · Endurance & Effort Regulation */
export const SESSION9_9_PACING = {
  rounds: 8,
  calibrationMs: 2800,
  tickMs: 80,
  holdGraceMs: 400,
  betweenRoundsMs: 1100,
  maxGameMs: 9 * 60 * 1000,
  starEveryNRounds: 2,
  /** Energy Trail — plan preview before sustained carry. */
  trailPreviewMs: 1420,
  /** Per-round energy orb effort targets (0..1). */
  energyTargets: [0.38, 0.44, 0.5, 0.56, 0.62, 0.68, 0.74, 0.8] as const,
  /** Per-round escalating endurance hold durations (ms). */
  trailHoldMs: [1680, 1840, 2000, 2180, 2380, 2600, 2840, 3100] as const,
  trailCaptureMs: 1080,
  fallbackTrailMs: [2900, 3100, 3300, 3500, 3700, 3900, 4100, 4300] as const,
  bandHalf: 0.05,
  /** Minimum energy carry pose form. */
  trailFormMin: 0.52,
  /** Effort samples used for endurance stability scoring. */
  stabilityWindow: 12,
  /** Long Haul Train — plan preview before sustained chug. */
  haulPreviewMs: 1440,
  /** Per-round steam chug effort targets (0..1). */
  chugTargets: [0.39, 0.45, 0.51, 0.57, 0.63, 0.69, 0.75, 0.81] as const,
  /** Per-round escalating long-haul chug hold durations (ms). */
  haulHoldMs: [1720, 1900, 2080, 2280, 2500, 2740, 3000, 3280] as const,
  haulArriveMs: 1100,
  fallbackHaulMs: [3000, 3200, 3400, 3600, 3800, 4000, 4200, 4400] as const,
  /** Minimum engineer lever chug pose form. */
  haulFormMin: 0.5,
  /** Mountain Push — plan preview before sustained push. */
  pushPreviewMs: 1450,
  /** Per-round mountain boulder push effort targets (0..1). */
  pushTargets: [0.4, 0.46, 0.52, 0.58, 0.64, 0.7, 0.76, 0.82] as const,
  /** Per-round escalating mountain push hold durations (ms). */
  pushHoldMs: [1760, 1940, 2140, 2360, 2600, 2860, 3140, 3440] as const,
  pushSummitMs: 1120,
  fallbackPushMs: [3100, 3300, 3500, 3700, 3900, 4100, 4300, 4500] as const,
  /** Minimum mountain wall-push pose form. */
  pushFormMin: 0.5,
  /** Endurance Quest — plan preview before sustained overhead brace. */
  questPreviewMs: 1470,
  /** Per-round quest pillar brace effort targets (0..1). */
  questTargets: [0.41, 0.47, 0.53, 0.59, 0.65, 0.71, 0.77, 0.83] as const,
  /** Per-round escalating quest brace hold durations (ms). */
  questHoldMs: [1800, 1980, 2180, 2400, 2640, 2900, 3180, 3480] as const,
  questCheckpointMs: 1140,
  fallbackQuestMs: [3200, 3400, 3600, 3800, 4000, 4200, 4400, 4600] as const,
  /** Minimum heroic overhead brace pose form. */
  questFormMin: 0.51,
  /** Power Marathon — plan preview before sustained gorilla power hold. */
  marathonPreviewMs: 1480,
  /** Per-round marathon power effort targets (0..1). */
  marathonTargets: [0.42, 0.48, 0.54, 0.6, 0.66, 0.72, 0.78, 0.84] as const,
  /** Per-round escalating marathon power hold durations (ms). */
  marathonHoldMs: [1840, 2020, 2220, 2440, 2680, 2940, 3220, 3520] as const,
  marathonFinishMs: 1160,
  fallbackMarathonMs: [3300, 3500, 3700, 3900, 4100, 4300, 4500, 4700] as const,
  /** Minimum gorilla power marathon pose form. */
  marathonFormMin: 0.52,
} as const;
