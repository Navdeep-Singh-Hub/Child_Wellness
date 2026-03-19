/**
 * Helpers for Color Scribble Fill: parse SVG path to points, point-in-polygon, area.
 */

export interface Point {
  x: number;
  y: number;
}

/** Parse simple SVG path (M x y L x y L x y ...) to array of points */
export function pathToPoints(path: string): Point[] {
  const points: Point[] = [];
  const parts = path.trim().split(/[\s,]+/);
  let i = 0;
  let current: Point | null = null;
  while (i < parts.length) {
    if (parts[i] === 'M' || parts[i] === 'L') {
      i++;
      if (i + 1 < parts.length) {
        const x = parseFloat(parts[i]);
        const y = parseFloat(parts[i + 1]);
        if (!Number.isNaN(x) && !Number.isNaN(y)) {
          current = { x, y };
          points.push(current);
        }
        i += 2;
      }
    } else if (parts[i] === 'm') {
      i++;
      if (i + 1 < parts.length) {
        const dx = parseFloat(parts[i]);
        const dy = parseFloat(parts[i + 1]);
        if (!Number.isNaN(dx) && !Number.isNaN(dy) && current) {
          current = { x: current.x + dx, y: current.y + dy };
          points.push(current);
        }
        i += 2;
      }
    } else {
      const x = parseFloat(parts[i]);
      const y = parseFloat(parts[i + 1]);
      if (!Number.isNaN(x) && !Number.isNaN(y)) {
        current = { x, y };
        points.push(current);
        i += 2;
      } else {
        i++;
      }
    }
  }
  return points;
}

/** Ray-casting point-in-polygon */
export function pointInPolygon(p: Point, polygon: Point[]): boolean {
  const n = polygon.length;
  if (n < 3) return false;
  let inside = false;
  const x = p.x;
  const y = p.y;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/** Shoelace formula for polygon area */
export function polygonArea(polygon: Point[]): number {
  const n = polygon.length;
  if (n < 3) return 0;
  let area = 0;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    area += polygon[j].x * polygon[i].y - polygon[i].x * polygon[j].y;
  }
  return Math.abs(area) / 2;
}
