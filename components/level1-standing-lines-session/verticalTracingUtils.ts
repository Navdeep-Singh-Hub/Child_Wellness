/**
 * Vertical (standing) line tracing: dots, direction (top→bottom), straightness.
 */
import { pathToPoints, pointToSegmentDist } from '@/components/level1-grip-session/shapeFillUtils';

export interface Point {
  x: number;
  y: number;
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Vertical dotted line: same x, y from top to bottom. */
export function verticalDots(x: number, topY: number, bottomY: number, count: number): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < count; i++) {
    const t = count > 1 ? i / (count - 1) : 0;
    points.push({ x, y: topY + (bottomY - topY) * t });
  }
  return points;
}

/** Check which dots are hit by stroke (within hitRadius), using segment distance. */
export function getConnectedDotIndices(
  strokePath: string,
  targetDots: Point[],
  hitRadius: number
): Set<number> {
  const pts = pathToPoints(strokePath);
  const connected = new Set<number>();
  for (let i = 0; i < targetDots.length; i++) {
    if (pts.length === 1) {
      if (distance(pts[0], targetDots[i]) <= hitRadius) connected.add(i);
      continue;
    }
    for (let pi = 0; pi < pts.length - 1; pi++) {
      if (pointToSegmentDist(targetDots[i], pts[pi], pts[pi + 1]) <= hitRadius) {
        connected.add(i);
        break;
      }
    }
  }
  return connected;
}

/** Merge strokes and return connected indices. */
export function getConnectedFromStrokes(
  strokes: { path: string }[],
  targetDots: Point[],
  hitRadius: number
): Set<number> {
  const all = new Set<number>();
  for (const s of strokes) {
    getConnectedDotIndices(s.path, targetDots, hitRadius).forEach((i) => all.add(i));
  }
  return all;
}

/** Direction: is stroke mostly downward (top → bottom)? Sample points, compare first/last and overall dy. */
export function isMostlyDownward(strokePath: string): boolean {
  const pts = pathToPoints(strokePath);
  if (pts.length < 2) return true;
  const first = pts[0];
  const last = pts[pts.length - 1];
  const dy = last.y - first.y;
  return dy > 0; // bottom has larger y
}

/** Vertical straightness: max horizontal deviation from average x. 0 = perfectly vertical. Tolerant. */
export function verticalStraightness(strokePath: string): { deviation: number; avgX: number } {
  const pts = pathToPoints(strokePath);
  if (pts.length === 0) return { deviation: 0, avgX: 0 };
  const avgX = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  let maxDev = 0;
  for (const p of pts) {
    maxDev = Math.max(maxDev, Math.abs(p.x - avgX));
  }
  return { deviation: maxDev, avgX };
}

/** Pass if stroke is mostly vertical (low horizontal deviation). Threshold in px. */
export function isPathMostlyVertical(strokePath: string, maxDeviationPx: number): boolean {
  const { deviation } = verticalStraightness(strokePath);
  return deviation <= maxDeviationPx;
}

export function completionPercent(connected: Set<number>, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, (connected.size / total) * 100);
}
