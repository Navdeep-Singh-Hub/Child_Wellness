/**
 * Pacing constants for OT Level 3 Session 2 (big vs small movements).
 */

export const SESSION2_PACING = {
  tapRounds: 10,
  gestureRounds: 8,
  bigCircleSize: 150,
  smallCircleSize: 40,
  bigSwipeThreshold: 200,
  smallSwipeThreshold: 80,
  bigThrowThreshold: 200,
  smallThrowThreshold: 80,
  minScale: 0.5,
  maxScale: 2.0,
  targetBigScale: 1.8,
  targetSmallScale: 0.6,
  widePathWidth: 60,
  thinPathWidth: 20,
  widePathWidthPct: 8,
  thinPathWidthPct: 3,
  pathTolerance: 1.5,
  pathStartX: 15,
  pathStartY: 50,
  pathEndX: 85,
  pathEndY: 50,
  nextRoundDelayMs: 420,
  cueDelayMs: 500,
} as const;
