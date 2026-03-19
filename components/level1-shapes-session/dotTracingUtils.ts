/**
 * Dot-to-dot tracing: target dots, stroke points, proximity detection, completion %.
 */
import { pathToPoints } from '@/components/level1-grip-session/shapeFillUtils';

export interface Point {
  x: number;
  y: number;
}

/** Distance between two points */
export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Check which target dots are "hit" by stroke points (within hitRadius). Returns Set of dot indices. */
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

/** Merge multiple strokes' paths and return combined connected indices */
export function getConnectedFromStrokes(
  strokes: { path: string }[],
  targetDots: Point[],
  hitRadius: number
): Set<number> {
  const all = new Set<number>();
  for (const s of strokes) {
    const connected = getConnectedDotIndices(s.path, targetDots, hitRadius);
    connected.forEach((i) => all.add(i));
  }
  return all;
}

/** Completion percentage (0–100) */
export function completionPercent(connected: Set<number>, totalDots: number): number {
  if (totalDots <= 0) return 0;
  return Math.min(100, (connected.size / totalDots) * 100);
}
