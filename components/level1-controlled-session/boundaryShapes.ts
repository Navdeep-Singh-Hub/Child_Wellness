/**
 * Circle, triangle, square boundaries in canvas space (after layout).
 */
import type { Point } from '@/components/level1-grip-session/shapeFillUtils';
import type { Boundary } from './boundaryUtils';

/** Circle centered in box (width x height) with radius = min(w,h)/2 * scale */
export function circleBoundary(width: number, height: number, scale = 0.42): Boundary {
  const cx = width / 2;
  const cy = height / 2;
  const r = (Math.min(width, height) / 2) * scale;
  return { type: 'circle', cx, cy, r };
}

/** Equilateral-ish triangle centered in box */
export function triangleBoundary(width: number, height: number, scale = 0.4): Boundary {
  const cx = width / 2;
  const cy = height / 2;
  const side = Math.min(width, height) * scale;
  const h = side * (Math.sqrt(3) / 2);
  const points: Point[] = [
    { x: cx, y: cy - h * 0.6 },
    { x: cx - side / 2, y: cy + h * 0.4 },
    { x: cx + side / 2, y: cy + h * 0.4 },
  ];
  return { type: 'polygon', points };
}

/** Square centered in box */
export function squareBoundary(width: number, height: number, scale = 0.38): Boundary {
  const cx = width / 2;
  const cy = height / 2;
  const half = (Math.min(width, height) / 2) * scale;
  const points: Point[] = [
    { x: cx - half, y: cy - half },
    { x: cx + half, y: cy - half },
    { x: cx + half, y: cy + half },
    { x: cx - half, y: cy + half },
  ];
  return { type: 'polygon', points };
}

export function getCirclePath(cx: number, cy: number, r: number): string {
  return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r}`;
}

export function getPolygonPath(points: Point[]): string {
  if (points.length === 0) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) d += ` L ${points[i].x} ${points[i].y}`;
  return d + ' Z';
}
