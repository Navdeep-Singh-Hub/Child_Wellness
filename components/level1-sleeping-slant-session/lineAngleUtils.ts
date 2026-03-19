/**
 * Sleeping (horizontal) + slanting lines: dots, angle detection, straightness.
 */
import { pathToPoints } from '@/components/level1-grip-session/shapeFillUtils';

export interface Point {
  x: number;
  y: number;
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Horizontal (sleeping) dotted line: same y, x from left to right. */
export function horizontalDots(y: number, leftX: number, rightX: number, count: number): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < count; i++) {
    const t = count > 1 ? i / (count - 1) : 0;
    points.push({ x: leftX + (rightX - leftX) * t, y });
  }
  return points;
}

/** Slant dots: from (x1,y1) to (x2,y2), count points. */
export function slantDots(x1: number, y1: number, x2: number, y2: number, count: number): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < count; i++) {
    const t = count > 1 ? i / (count - 1) : 0;
    points.push({
      x: x1 + (x2 - x1) * t,
      y: y1 + (y2 - y1) * t,
    });
  }
  return points;
}

/** Check which dots are hit by stroke (within hitRadius). */
export function getConnectedDotIndices(
  strokePath: string,
  targetDots: Point[],
  hitRadius: number
): Set<number> {
  const strokePoints = pathToPoints(strokePath);
  const connected = new Set<number>();
  for (let i = 0; i < targetDots.length; i++) {
    const dot = targetDots[i];
    for (const p of strokePoints) {
      if (distance(p, dot) <= hitRadius) {
        connected.add(i);
        break;
      }
    }
  }
  return connected;
}

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

/** Horizontal straightness: max vertical deviation from average y. */
export function horizontalStraightness(strokePath: string): { deviation: number; avgY: number } {
  const pts = pathToPoints(strokePath);
  if (pts.length === 0) return { deviation: 0, avgY: 0 };
  const avgY = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  let maxDev = 0;
  for (const p of pts) {
    maxDev = Math.max(maxDev, Math.abs(p.y - avgY));
  }
  return { deviation: maxDev, avgY };
}

export function isPathMostlyHorizontal(strokePath: string, maxDeviationPx: number): boolean {
  const { deviation } = horizontalStraightness(strokePath);
  return deviation <= maxDeviationPx;
}

/** Stroke angle in degrees (-180 to 180). From first to last point. */
export function getStrokeAngle(strokePath: string): number {
  const pts = pathToPoints(strokePath);
  if (pts.length < 2) return 0;
  const dx = pts[pts.length - 1].x - pts[0].x;
  const dy = pts[pts.length - 1].y - pts[0].y;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

/** Check if angle is near target (degrees). Tolerance in degrees. */
export function isAngleNear(angleDeg: number, targetDeg: number, toleranceDeg: number): boolean {
  let diff = Math.abs(angleDeg - targetDeg);
  if (diff > 180) diff = 360 - diff;
  return diff <= toleranceDeg;
}

/** Horizontal ≈ 0° or 180°; left slant ≈ 45°; right slant ≈ -45° (or 135°). */
export function isPathMostlySlant(strokePath: string, targetAngleDeg: number, toleranceDeg: number): boolean {
  const angle = getStrokeAngle(strokePath);
  return isAngleNear(angle, targetAngleDeg, toleranceDeg);
}

export function completionPercent(connected: Set<number>, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, (connected.size / total) * 100);
}
