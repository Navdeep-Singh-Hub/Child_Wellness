/** Pacing — OT Level 9 Session 8 · Proprioceptive Sequencing */
export const SESSION9_8_PACING = {
  rounds: 8,
  calibrationMs: 2800,
  tickMs: 80,
  holdGraceMs: 350,
  betweenRoundsMs: 1100,
  betweenStepsMs: 900,
  maxGameMs: 8 * 60 * 1000,
  starEveryNRounds: 2,
  /** Push Then Carry — plan preview before step 1. */
  planPreviewMs: 1580,
  /** Per-round push effort targets (0..1). */
  pushTargets: [0.4, 0.46, 0.52, 0.58, 0.64, 0.7, 0.76, 0.82] as const,
  /** Per-round carry effort targets (0..1). */
  carryTargets: [0.38, 0.44, 0.5, 0.56, 0.62, 0.68, 0.74, 0.8] as const,
  bandHalf: 0.05,
  pushHoldMs: 1480,
  carryHoldMs: 1580,
  sequenceCompleteMs: 1140,
  fallbackPushMs: 2350,
  fallbackCarryMs: 2550,
  /** Minimum wall-push pose form (extended arms + chest-height palms). */
  pushFormMin: 0.5,
  /** Minimum carry pose form (elbow bend + waist-height grip). */
  carryFormMin: 0.52,
  /** Reach Then Press — plan preview before step 1. */
  reachPlanPreviewMs: 1560,
  /** Per-round press effort targets (0..1). */
  pressTargets: [0.4, 0.46, 0.52, 0.58, 0.64, 0.7, 0.76, 0.82] as const,
  reachHoldMs: 1520,
  pressHoldMs: 1480,
  reachPressCompleteMs: 1140,
  fallbackReachMs: 2380,
  fallbackPressMs: 2350,
  /** Full-body reach pose match tolerance. */
  reachTolerance: 0.14,
  /** Minimum reach pose match before hold counts. */
  reachReachMin: 0.55,
  /** Minimum press pose form (extended arms + chest-height palms). */
  pressFormMin: 0.5,
  /** Power Sequence — plan preview before step 1. */
  powerPlanPreviewMs: 1570,
  /** Per-round charge effort targets (0..1). */
  chargeTargets: [0.42, 0.48, 0.54, 0.6, 0.66, 0.72, 0.78, 0.84] as const,
  /** Per-round blast effort targets (0..1). */
  blastTargets: [0.44, 0.5, 0.56, 0.62, 0.68, 0.74, 0.8, 0.86] as const,
  chargeHoldMs: 1540,
  blastHoldMs: 1500,
  powerSequenceCompleteMs: 1160,
  fallbackChargeMs: 2420,
  fallbackBlastMs: 2400,
  /** Minimum gorilla charge pose form. */
  chargeFormMin: 0.5,
  /** Minimum launch blast pose form. */
  blastFormMin: 0.5,
  /** Pirate Work Mission — plan preview before step 1. */
  piratePlanPreviewMs: 1590,
  /** Per-round haul (tow-rope) effort targets (0..1). */
  haulTargets: [0.41, 0.47, 0.53, 0.59, 0.65, 0.71, 0.77, 0.83] as const,
  /** Per-round stow (treasure carry) effort targets (0..1). */
  stowTargets: [0.39, 0.45, 0.51, 0.57, 0.63, 0.69, 0.75, 0.81] as const,
  haulHoldMs: 1530,
  stowHoldMs: 1560,
  pirateMissionCompleteMs: 1150,
  fallbackHaulMs: 2410,
  fallbackStowMs: 2480,
  /** Minimum ship tow rope pull pose form. */
  haulFormMin: 0.5,
  /** Minimum treasure stow carry pose form. */
  stowFormMin: 0.52,
  /** Rainbow Challenge — plan preview before step 1. */
  rainbowPlanPreviewMs: 1580,
  /** Per-round glow (overhead hold) effort targets (0..1). */
  glowTargets: [0.4, 0.46, 0.52, 0.58, 0.64, 0.7, 0.76, 0.82] as const,
  archHoldMs: 1540,
  glowHoldMs: 1520,
  rainbowChallengeCompleteMs: 1160,
  fallbackArchMs: 2400,
  fallbackGlowMs: 2450,
  /** Full-body rainbow arch pose match tolerance. */
  archTolerance: 0.15,
  /** Minimum rainbow arch pose match before hold counts. */
  archReachMin: 0.54,
  /** Minimum overhead glow hold pose form. */
  glowFormMin: 0.5,
} as const;
