/** Pacing — OT Level 9 Session 7 · Movement Calibration */
export const SESSION9_7_PACING = {
  rounds: 8,
  calibrationMs: 2800,
  tickMs: 80,
  holdGraceMs: 350,
  betweenRoundsMs: 1100,
  roundIntroMs: 700,
  maxGameMs: 8 * 60 * 1000,
  starEveryNRounds: 2,
  /** Slow Motion — per-round calibration effort targets (0..1). */
  slowTargets: [0.38, 0.44, 0.5, 0.56, 0.62, 0.68, 0.74, 0.8] as const,
  slowBandHalf: 0.05,
  slowPreviewMs: 1510,
  slowHoldMs: 1710,
  slowCalibrateMs: 1210,
  fallbackSlowMs: 3110,
  /** Full-body trajectory match tolerance. */
  slowTolerance: 0.14,
  /** Minimum pose reach before slow hold counts. */
  slowReachMin: 0.55,
  /** Max limb motion per tick for glacial pace (normalized). */
  slowSpeedCeiling: 0.055,
  /** Rolling slow-pace score must exceed this during approach. */
  slowPaceMin: 0.68,
  /** Speed intensity above this resets hold (too fast). */
  slowFastCutoff: 0.42,
  /** Fast Dash — per-round lock effort targets (0..1). */
  dashTargets: [0.4, 0.46, 0.52, 0.58, 0.64, 0.7, 0.76, 0.82] as const,
  dashBandHalf: 0.05,
  dashPreviewMs: 1480,
  dashHoldMs: 1580,
  dashLockMs: 1180,
  fallbackDashMs: 2900,
  dashTolerance: 0.15,
  /** Minimum checkpoint reach before lock hold counts. */
  dashReachMin: 0.58,
  /** Minimum burst intensity for a valid turbo dash. */
  dashBurstMin: 0.28,
  /** Maximum burst intensity before reckless warning. */
  dashBurstMax: 0.78,
  /** Peak burst required during round to allow lock. */
  dashBurstRequired: 0.32,
  /** Match My Speed — per-round effort targets (0..1). */
  matchTargets: [0.39, 0.45, 0.51, 0.57, 0.63, 0.69, 0.75, 0.81] as const,
  matchBandHalf: 0.05,
  matchSpeedBandHalf: 0.06,
  matchPreviewMs: 1520,
  matchHoldMs: 1680,
  matchSyncedMs: 1200,
  fallbackMatchMs: 3050,
  matchTolerance: 0.14,
  matchReachMin: 0.56,
  /** Rolling speed-match accuracy required during hold. */
  matchSpeedMin: 0.65,
  /** Movement intensity normalization ceiling. */
  matchMotionCeiling: 0.12,
  /** Speed Control — per-round governor effort targets (0..1). */
  controlTargets: [0.41, 0.47, 0.53, 0.59, 0.65, 0.71, 0.77, 0.83] as const,
  controlBandHalf: 0.05,
  controlPreviewMs: 1500,
  controlHoldMs: 1660,
  controlSealMs: 1190,
  fallbackControlMs: 3080,
  controlTolerance: 0.14,
  controlReachMin: 0.57,
  /** Rolling bracket accuracy required during hold. */
  controlBracketMin: 0.66,
  controlMotionCeiling: 0.12,
  /** Rhythm Move — per-round rhythm effort targets (0..1). */
  rhythmTargets: [0.4, 0.46, 0.52, 0.58, 0.64, 0.7, 0.76, 0.82] as const,
  rhythmBandHalf: 0.05,
  rhythmPreviewMs: 1540,
  rhythmHoldMs: 1400,
  rhythmGrooveMs: 1200,
  fallbackRhythmMs: 3200,
  rhythmTolerance: 0.14,
  rhythmReachMin: 0.55,
  /** Beat pulse detection window (ms). */
  rhythmBeatWindowMs: 420,
  /** Minimum motion intensity during beat window. */
  rhythmPulseMin: 0.22,
  rhythmMotionCeiling: 0.12,
  /** Fraction of beats that must be hit (0..1). */
  rhythmBeatsRequired: 0.75,
} as const;
