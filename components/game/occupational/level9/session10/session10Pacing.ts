/** Pacing — OT Level 9 Session 10 · Proprioceptive Adventure */
export const SESSION9_10_PACING = {
  rounds: 8,
  calibrationMs: 2800,
  tickMs: 80,
  holdGraceMs: 350,
  betweenRoundsMs: 1100,
  maxGameMs: 8 * 60 * 1000,
  starEveryNRounds: 2,
  bandHalf: 0.05,
  /** Jungle Worksite — plan preview before sustained log haul. */
  worksitePreviewMs: 1420,
  /** Per-round jungle log haul effort targets (0..1). */
  worksiteTargets: [0.38, 0.44, 0.5, 0.56, 0.62, 0.68, 0.74, 0.8] as const,
  /** Per-round escalating haul hold durations (ms). */
  worksiteHoldMs: [1650, 1720, 1800, 1880, 1960, 2040, 2120, 2200] as const,
  worksiteDeliverMs: 1100,
  fallbackWorksiteMs: [2900, 3000, 3100, 3200, 3300, 3400, 3500, 3600] as const,
  /** Minimum jungle carry pose form. */
  worksiteFormMin: 0.52,
  /** Space Builder — plan preview before sustained module push. */
  builderPreviewMs: 1440,
  /** Per-round space module push effort targets (0..1). */
  builderTargets: [0.4, 0.46, 0.52, 0.58, 0.64, 0.7, 0.76, 0.82] as const,
  /** Per-round escalating module install hold durations (ms). */
  builderHoldMs: [1680, 1760, 1840, 1920, 2000, 2080, 2160, 2240] as const,
  builderLockMs: 1120,
  fallbackBuilderMs: [3000, 3100, 3200, 3300, 3400, 3500, 3600, 3700] as const,
  /** Minimum space bulkhead push pose form. */
  builderFormMin: 0.5,
  /** Pirate Cargo Mission — plan preview before sustained tow-rope hoist. */
  cargoPreviewMs: 1460,
  /** Per-round cargo hoist pull effort targets (0..1). */
  cargoTargets: [0.42, 0.48, 0.54, 0.6, 0.66, 0.72, 0.78, 0.84] as const,
  /** Per-round escalating cargo hoist hold durations (ms). */
  cargoHoldMs: [1700, 1780, 1860, 1940, 2020, 2100, 2180, 2260] as const,
  cargoLoadMs: 1140,
  fallbackCargoMs: [3100, 3200, 3300, 3400, 3500, 3600, 3700, 3800] as const,
  /** Minimum pirate tow-rope hoist pose form. */
  cargoFormMin: 0.48,
  /** Mountain Rescue — plan preview before sustained overhead rope brace. */
  rescuePreviewMs: 1480,
  /** Per-round rescue rope brace effort targets (0..1). */
  rescueTargets: [0.44, 0.5, 0.56, 0.62, 0.68, 0.74, 0.8, 0.86] as const,
  /** Per-round escalating rescue brace hold durations (ms). */
  rescueHoldMs: [1720, 1800, 1880, 1960, 2040, 2120, 2200, 2280] as const,
  rescueSaveMs: 1160,
  fallbackRescueMs: [3200, 3300, 3400, 3500, 3600, 3700, 3800, 3900] as const,
  /** Minimum alpine overhead rescue brace pose form. */
  rescueFormMin: 0.5,
  /** Proprioception Champion — plan preview before sustained power hold. */
  championPreviewMs: 1500,
  /** Per-round champion power effort targets (0..1). */
  championTargets: [0.46, 0.52, 0.58, 0.64, 0.7, 0.76, 0.82, 0.88] as const,
  /** Per-round escalating champion power hold durations (ms). */
  championHoldMs: [1740, 1820, 1900, 1980, 2060, 2140, 2220, 2300] as const,
  championCrownMs: 1180,
  fallbackChampionMs: [3300, 3400, 3500, 3600, 3700, 3800, 3900, 4000] as const,
  /** Minimum champion gorilla power pose form. */
  championFormMin: 0.5,
} as const;
