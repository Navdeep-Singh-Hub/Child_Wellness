/**
 * Pacing constants for OT Level 1 Session 7 (visual discrimination).
 */

export const SESSION7_PACING = {
  nextRoundDelayMs: 400,
  successPopMs: 260,
  shakeResetMs: 400,
  glowDurationMs: 1100,
  showShapeMs: 1300,
  bigOne: { largeSize: 158, smallSize: 70 },
  smallOne: { large: 138, medium: 92, small: 50 },
  oddOne: { itemSize: 92 },
  shapeShow: { previewSize: 110, choiceSize: 96 },
  matchOutline: { outlineSize: 120, shapeSize: 88 },
} as const;
