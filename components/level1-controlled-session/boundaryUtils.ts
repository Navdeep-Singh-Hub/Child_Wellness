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
  const radius = Math.max(2, brushSize);
  const cellSize = Math.max(4, Math.floor(brushSize * 0.6));
  const insideCells = new Set<string>();
  const outsideCells = new Set<string>();

  const addCoverage = (x: number, y: number, r: number) => {
    const gxMin = Math.floor((x - r) / cellSize);
    const gxMax = Math.floor((x + r) / cellSize);
    const gyMin = Math.floor((y - r) / cellSize);
    const gyMax = Math.floor((y + r) / cellSize);
    for (let gx = gxMin; gx <= gxMax; gx++) {
      for (let gy = gyMin; gy <= gyMax; gy++) {
        const cx = gx * cellSize + cellSize / 2;
        const cy = gy * cellSize + cellSize / 2;
        const dx = cx - x;
        const dy = cy - y;
        if (dx * dx + dy * dy > r * r) continue;
        const key = `${gx},${gy}`;
        if (pointInBoundary({ x: cx, y: cy }, boundary)) {
          insideCells.add(key);
        } else {
          outsideCells.add(key);
        }
      }
    }
  };

  for (const stroke of strokes) {
    const points = pathToPoints(stroke.path);
    if (points.length === 0) continue;
    const r = Math.max(2, stroke.width ?? radius);
    addCoverage(points[0].x, points[0].y, r);
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const steps = Math.max(1, Math.ceil(dist / (cellSize * 0.5)));
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        const x = a.x + (b.x - a.x) * t;
        const y = a.y + (b.y - a.y) * t;
        addCoverage(x, y, r);
      }
    }
  }

  const totalCoveredCells = insideCells.size + outsideCells.size;
  const totalStrokeArea = totalCoveredCells * cellSize * cellSize;
  const insideStrokeArea = insideCells.size * cellSize * cellSize;
  const outsideStrokeArea = outsideCells.size * cellSize * cellSize;

  let shapeCellCount = 0;
  if (boundary.type === 'circle') {
    const { cx, cy, r } = boundary;
    const gxMin = Math.floor((cx - r) / cellSize);
    const gxMax = Math.floor((cx + r) / cellSize);
    const gyMin = Math.floor((cy - r) / cellSize);
    const gyMax = Math.floor((cy + r) / cellSize);
    for (let gx = gxMin; gx <= gxMax; gx++) {
      for (let gy = gyMin; gy <= gyMax; gy++) {
        const px = gx * cellSize + cellSize / 2;
        const py = gy * cellSize + cellSize / 2;
        if (pointInCircle({ x: px, y: py }, boundary)) shapeCellCount += 1;
      }
    }
  } else {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const p of boundary.points) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
    const gxMin = Math.floor(minX / cellSize);
    const gxMax = Math.floor(maxX / cellSize);
    const gyMin = Math.floor(minY / cellSize);
    const gyMax = Math.floor(maxY / cellSize);
    for (let gx = gxMin; gx <= gxMax; gx++) {
      for (let gy = gyMin; gy <= gyMax; gy++) {
        const px = gx * cellSize + cellSize / 2;
        const py = gy * cellSize + cellSize / 2;
        if (pointInPolygon({ x: px, y: py }, boundary.points)) shapeCellCount += 1;
      }
    }
  }

  const fillInsidePercent = shapeCellCount > 0 ? (insideCells.size / shapeCellCount) * 100 : 0;
  const outsidePercent = totalCoveredCells > 0 ? (outsideStrokeArea / totalStrokeArea) * 100 : 0;
  const accuracy = totalCoveredCells > 0 ? (insideStrokeArea / totalStrokeArea) * 100 : 0;

  return {
    fillInsidePercent,
    outsidePercent,
    accuracy,
    totalStrokeArea,
    insideStrokeArea,
  };
}
