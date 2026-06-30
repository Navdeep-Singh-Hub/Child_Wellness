/** Pacing — OT Level 9 Session 2 · Pressure Grading */
export const SESSION9_2_PACING = {
  rounds: 8,
  calibrationMs: 2800,
  tickMs: 80,
  holdGraceMs: 350,
  betweenRoundsMs: 1100,
  roundIntroMs: 700,
  maxGameMs: 8 * 60 * 1000,
  starEveryNRounds: 2,
  /** Decorate The Cake — graded piping pressure targets (0..1). */
  decorateTargets: [0.36, 0.44, 0.52, 0.58, 0.64, 0.7, 0.76, 0.82] as const,
  decorateHoldMs: 1400,
  decorateStrokeMs: 950,
  fallbackPipeMs: 2500,
  /** Paint Pressure — brush press targets (0..1). */
  paintTargets: [0.34, 0.42, 0.5, 0.56, 0.62, 0.68, 0.74, 0.8] as const,
  paintHoldMs: 1350,
  paintStrokeMs: 1000,
  fallbackBrushMs: 2550,
  /** Magic Touch — gentle fingertip touch targets (0..1). */
  magicTargets: [0.28, 0.34, 0.4, 0.46, 0.52, 0.58, 0.64, 0.7] as const,
  magicHoldMs: 1300,
  magicActivateMs: 900,
  fallbackTouchMs: 2400,
  magicCrushMargin: 0.18,
  /** Inflate Carefully — target fill levels (0..1) per balloon. */
  inflateFillTargets: [0.38, 0.45, 0.52, 0.58, 0.64, 0.7, 0.76, 0.82] as const,
  /** Force band for safe inflation (center per round scales with fill). */
  inflateForceTargets: [0.32, 0.38, 0.44, 0.5, 0.56, 0.62, 0.68, 0.74] as const,
  inflateForceBand: 0.05,
  inflatePopMargin: 0.12,
  inflateFillBand: 0.04,
  inflateFillRate: 0.00042,
  inflateHoldMs: 1450,
  inflateSealMs: 950,
  fallbackInflateMs: 2700,
  inflatePopResetMs: 900,
  /** Goldilocks Pressure — "just right" porridge targets (0..1). */
  goldilocksTargets: [0.36, 0.48, 0.42, 0.58, 0.52, 0.66, 0.6, 0.74] as const,
  goldilocksTolerance: 0.042,
  goldilocksPreviewMs: 1400,
  goldilocksHoldMs: 1350,
  goldilocksTasteMs: 1050,
  fallbackGoldilocksMs: 2650,
} as const;
