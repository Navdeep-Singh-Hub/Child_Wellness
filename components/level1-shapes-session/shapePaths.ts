/**
 * Dots and paths for circle and triangle tracing (in canvas space).
 */
import type { Point } from './dotTracingUtils';

/** Evenly spaced dots on a circle. center (cx,cy), radius r, count dots. */
export function circleDots(cx: number, cy: number, r: number, count: number): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2; // start from top
    points.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    });
  }
  return points;
}

/** Triangle dots: 3 vertices + optional points along each edge (segmentCount per edge). */
export function triangleDots(
  width: number,
  height: number,
  scale: number,
  segmentCount: number
): Point[] {
  const cx = width / 2;
  const cy = height / 2;
  const side = Math.min(width, height) * scale;
  const h = side * (Math.sqrt(3) / 2);
  const top: Point = { x: cx, y: cy - h * 0.6 };
  const left: Point = { x: cx - side / 2, y: cy + h * 0.4 };
  const right: Point = { x: cx + side / 2, y: cy + h * 0.4 };
  const points: Point[] = [];
  const addSegment = (a: Point, b: Point) => {
    for (let i = 0; i <= segmentCount; i++) {
      if (i === 0) continue;
      const t = i / segmentCount;
      points.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
  };
  points.push(top);
  addSegment(top, right);
  points.push(right);
  addSegment(right, left);
  points.push(left);
  addSegment(left, top);
  return points;
}

/** Triangle edges for "glow when traced": vertex indices [startIdx, endIdx]. */
export function triangleEdges(segmentCount: number): [number, number][] {
  const n = segmentCount + 1;
  return [[0, n], [n, 2 * n], [2 * n, 0]];
}
