/**
 * Pacing constants for OT Level 1 Session 5 (drag / trace games).
 */

export const SESSION5_PACING = {
  dragBall: {
    goalTolerance: 14,
    nextRoundDelayMs: 400,
    ballSize: 72,
    goalSize: 110,
  },
  followLine: {
    lineTolerance: 28,
    lineWidth: 18,
    objectSize: 56,
    endTolerance: 28,
    minProgress: 0.75,
    nextRoundDelayMs: 400,
  },
  dragAnimal: {
    homeTolerance: 14,
    nextRoundDelayMs: 400,
    animalSize: 68,
    homeSize: 96,
  },
  dragSlowly: {
    maxSpeed: 32,
    slowTarget: 14,
    minTimeDelta: 20,
    nextRoundDelayMs: 400,
    barSize: 72,
  },
  puzzlePiece: {
    matchTolerance: 10,
    snapDelayMs: 280,
    nextRoundDelayMs: 420,
    pieceSize: 96,
    outlineSize: 112,
  },
} as const;
