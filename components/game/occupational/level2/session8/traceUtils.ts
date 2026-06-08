/**
 * Trace helpers for OT Level 2 Session 8 small-shape games.
 */
export type { Point } from '@/components/game/occupational/level2/session7/traceUtils';
export {
  advanceTraceProgress,
  buildFullCirclePaths,
  buildPolygonStrokePath,
  circleTraceProgress,
  distanceToFullCircle,
  distanceToPolygon,
  makeSquarePoints,
  polygonTraceProgress,
  useTraceSound,
} from '@/components/game/occupational/level2/session7/traceUtils';

import type { Point } from '@/components/game/occupational/level2/session7/traceUtils';

export type DotShapeKind = 'triangle' | 'pentagon' | 'hexagon';

export const makeRegularPolygonPoints = (cx: number, cy: number, size: number, sides: number): Point[] => {
  const pts: Point[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = sides === 6 ? (i * Math.PI) / 3 : (i * 2 * Math.PI) / sides - Math.PI / 2;
    const r = size / 2;
    pts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }
  return pts;
};

export const sidesForDotShape = (kind: DotShapeKind) => (kind === 'triangle' ? 3 : kind === 'pentagon' ? 5 : 6);

export const shrinkRadiusForRound = (round: number, total: number, initial: number, min: number) => {
  if (total <= 1) return initial;
  const t = (round - 1) / (total - 1);
  return initial - (initial - min) * t;
};
