/**
 * Curved path tracing: semicircle, wave, full circle dot paths + vowel letter dot paths.
 */
import { pathToPoints, pointToSegmentDist } from '@/components/level1-grip-session/shapeFillUtils';

export interface Point {
  x: number;
  y: number;
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Semicircle dots (top arc). */
export function semicircleDots(cx: number, cy: number, r: number, count: number): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < count; i++) {
    const t = count > 1 ? i / (count - 1) : 0;
    const angle = Math.PI + t * Math.PI;
    pts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }
  return pts;
}

/** Wave curve dots (horizontal wave). */
export function waveDots(startX: number, endX: number, cy: number, amplitude: number, count: number): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < count; i++) {
    const t = count > 1 ? i / (count - 1) : 0;
    const x = startX + (endX - startX) * t;
    const y = cy + amplitude * Math.sin(t * Math.PI * 2);
    pts.push({ x, y });
  }
  return pts;
}

/** Full circle dots. */
export function fullCircleDots(cx: number, cy: number, r: number, count: number): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < count; i++) {
    const t = count > 1 ? i / (count - 1) : 0;
    const angle = -Math.PI / 2 + t * Math.PI * 2;
    pts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }
  return pts;
}

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

export function completionPercent(connected: Set<number>, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, (connected.size / total) * 100);
}

/** Perpendicular distance from point to line defined by two endpoints. */
function pointToLineDistance(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return distance(p, a);
  return Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / Math.sqrt(lenSq);
}

/** Detect if a stroke has curvature (not a straight line). */
export function hasCurvature(strokePath: string): boolean {
  const pts = pathToPoints(strokePath);
  if (pts.length < 4) return false;
  const first = pts[0];
  const last = pts[pts.length - 1];
  const straightDist = distance(first, last);
  if (straightDist < 20) return true;

  let maxDeviation = 0;
  for (const p of pts) {
    const dev = pointToLineDistance(p, first, last);
    if (dev > maxDeviation) maxDeviation = dev;
  }
  if (maxDeviation > straightDist * 0.06) return true;

  let totalPathLen = 0;
  for (let i = 1; i < pts.length; i++) {
    totalPathLen += distance(pts[i - 1], pts[i]);
  }
  return totalPathLen > straightDist * 1.08;
}
