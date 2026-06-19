/** Pacing — OT Level 5 Session 3 · Drag to Track */
export const SESSION5_3_PACING = {
  rounds: 8,
  xpPerScore: 15,
  nextRoundDelayMs: 500,
  roundStartDelayMs: 450,
  followDistancePx: 95,
  followHoldMs: 2800,
  moveTickMs: 16,
  targetHalfPx: 30,
  fingerHalfPx: 20,
} as const;

export type DragMotionMode = 'horizontal' | 'vertical' | 'figure8' | 'zigzag' | 'orbit';
