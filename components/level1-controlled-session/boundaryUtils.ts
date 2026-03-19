/**
 * Boundary detection for controlled scribbling: circle, polygon, fill %, outside %.
 */
import { pathToPoints, pointInPolygon, polygonArea, Point } from '@/components/level1-grip-session/shapeFillUtils';

export type Boundary =
  | { type: 'circle'; cx: number; cy: number; r: number }
  | { type: 'polygon'; points: Point[] };

export function pointInCircle(p: Point, circle: { cx: number; cy: number; r: number }): boolean {
  const dx = p.x - circle.cx;
  const dy = p.y - circle.cy;
  return dx * dx + dy * dy <= circle.r * circle.r;
}

export function circleArea(r: number): number {
  return Math.PI * r * r;
}

function pointInBoundary(p: Point, boundary: Boundary): boolean {
  if (boundary.type === 'circle') return pointInCircle(p, boundary);
  return pointInPolygon(p, boundary.points);
}

export function boundaryArea(boundary: Boundary): number {
  if (boundary.type === 'circle') return circleArea(boundary.r);
  return polygonArea(boundary.points);
}

export interface FillStats {
  fillInsidePercent: number;
  outsidePercent: number;
  accuracy: number;
  totalStrokeArea: number;
  insideStrokeArea: number;
}

export interface StrokeLike {
  path: string;
  width: number;
}

/** Compute fill % inside boundary, % of strokes outside, and accuracy (inside/total). */
export function getFillStats(
  strokes: StrokeLike[],
  boundary: Boundary,
  brushSize: number
): FillStats {
  const shapeArea = boundaryArea(boundary);
  const brushArea = Math.PI * brushSize * brushSize;
  let insideStrokeArea = 0;
  let totalStrokeArea = 0;

  for (const stroke of strokes) {
    const points = pathToPoints(stroke.path);
    const w = stroke.width ?? brushSize;
    const area = Math.PI * w * w;
    for (const p of points) {
      totalStrokeArea += area;
      if (pointInBoundary(p, boundary)) insideStrokeArea += area;
    }
  }

  const outsideStrokeArea = totalStrokeArea - insideStrokeArea;
  const fillInsidePercent = shapeArea > 0 ? (insideStrokeArea / shapeArea) * 100 : 0;
  const outsidePercent = totalStrokeArea > 0 ? (outsideStrokeArea / totalStrokeArea) * 100 : 0;
  const accuracy = totalStrokeArea > 0 ? (insideStrokeArea / totalStrokeArea) * 100 : 0;

  return {
    fillInsidePercent,
    outsidePercent,
    accuracy,
    totalStrokeArea,
    insideStrokeArea,
  };
}
