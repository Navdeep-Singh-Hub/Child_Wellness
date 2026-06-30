/** Pacing — OT Level 9 Session 3 · Joint Position Awareness */
export const SESSION9_3_PACING = {
  rounds: 8,
  calibrationMs: 2800,
  tickMs: 80,
  holdGraceMs: 350,
  betweenRoundsMs: 1100,
  roundIntroMs: 700,
  maxGameMs: 8 * 60 * 1000,
  starEveryNRounds: 2,
  /** Robot Arms — joint match tolerance (0..1 per raise/elbow axis). */
  robotJointTolerance: 0.11,
  robotPreviewMs: 1500,
  robotHoldMs: 1400,
  robotCalibrateMs: 950,
  fallbackRobotMs: 2800,
  /** Match The Legs — knee lift / knee bend tolerance. */
  legJointTolerance: 0.12,
  legPreviewMs: 1500,
  legHoldMs: 1450,
  legLockMs: 980,
  fallbackLegMs: 2900,
  /** Copy The Pose — full-body (arms + legs) match tolerance. */
  copyPoseTolerance: 0.13,
  copyPreviewMs: 1600,
  copyHoldMs: 1500,
  copyMirrorMs: 1020,
  fallbackCopyMs: 3000,
  /** Mirror Body — lateral (opposite-side) full-body mirror tolerance. */
  mirrorBodyTolerance: 0.14,
  mirrorPreviewMs: 1700,
  mirrorHoldMs: 1550,
  mirrorReflectMs: 1050,
  fallbackMirrorMs: 3100,
  /** Position Match — focused joint position grid (tighter tolerance). */
  positionMatchTolerance: 0.1,
  positionPreviewMs: 1650,
  positionHoldMs: 1600,
  positionLockMs: 1080,
  fallbackPositionMs: 3200,
} as const;
