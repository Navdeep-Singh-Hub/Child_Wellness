/**
 * Boundary detection for controlled scribbling: circle, polygon, fill %, outside ratio.
 * Only stroke samples INSIDE the boundary contribute to fill coverage (prevents cheating).
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

export function pointInBoundary(p: Point, boundary: Boundary): boolean {
  if (boundary.type === 'circle') return pointInCircle(p, boundary);
  return pointInPolygon(p, boundary.points);
}

export function boundaryArea(boundary: Boundary): number {
  if (boundary.type === 'circle') return circleArea(boundary.r);
  return polygonArea(boundary.points);
}

export interface FillStats {
  /** Fraction of shape grid cells covered by valid (inside-only) strokes, 0–1 */
  insideCoverage: number;
  /** Raw fill % of the shape (0–100), inside cells / shape cells */
  fillInsidePercent: number;
  /** Display fill % after penalty when outsideRatio > 0.2 */
  fillDisplayPercent: number;
  /** Fraction of stroke sample points outside the boundary, 0–1 */
  outsideRatio: number;
  /** Fraction of stroke sample points inside the boundary, 0–1 */
  insideRatio: number;
  insidePoints: number;
  outsidePoints: number;
  /** Legacy: outsideRatio * 100 for games that compare to a max percent */
  outsidePercent: number;
  /** Legacy: insidePoints / totalPoints * 100 */
  accuracy: number;
  totalStrokeArea: number;
  insideStrokeArea: number;
  /** True when strict win condition is met */
  passesStrict: boolean;
}

export interface StrokeLike {
  path: string;
  width: number;
}

const OUTSIDE_PENALTY_THRESHOLD = 0.2;
const STRICT_COVERAGE_MIN = 0.95;
const STRICT_OUTSIDE_MAX = 0.1;

/** Add grid cells covered by brush at (x,y) only if they lie inside the boundary shape. */
function addInsideCoverageCells(
  x: number,
  y: number,
  r: number,
  cellSize: number,
  boundary: Boundary,
  insideCells: Set<string>
) {
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
      }
    }
  }
}

/** Compute fill %, point ratios, penalty. Only inside stroke samples add coverage. */
export function getFillStats(
  strokes: StrokeLike[],
  boundary: Boundary,
  brushSize: number
): FillStats {
  const radius = Math.max(2, brushSize);
  const cellSize = Math.max(4, Math.floor(brushSize * 0.6));
  const insideCells = new Set<string>();

  let insidePoints = 0;
  let outsidePoints = 0;

  for (const stroke of strokes) {
    const points = pathToPoints(stroke.path);
    if (points.length === 0) continue;
    const r = Math.max(2, stroke.width ?? radius);

    const sampleAndCount = (x: number, y: number) => {
      if (pointInBoundary({ x, y }, boundary)) {
        insidePoints += 1;
        addInsideCoverageCells(x, y, r, cellSize, boundary, insideCells);
      } else {
        outsidePoints += 1;
      }
    };

    sampleAndCount(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const steps = Math.max(1, Math.ceil(dist / (cellSize * 0.5)));
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        const x = a.x + (b.x - a.x) * t;
        const y = a.y + (b.y - a.y) * t;
        sampleAndCount(x, y);
      }
    }
  }

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

  const insideCoverage = shapeCellCount > 0 ? insideCells.size / shapeCellCount : 0;
  let fillInsidePercent = shapeCellCount > 0 ? (insideCells.size / shapeCellCount) * 100 : 0;

  const totalPoints = insidePoints + outsidePoints;
  const outsideRatio = totalPoints > 0 ? outsidePoints / totalPoints : 0;
  const insideRatio = totalPoints > 0 ? insidePoints / totalPoints : 0;

  let fillDisplayPercent = fillInsidePercent;
  if (outsideRatio > OUTSIDE_PENALTY_THRESHOLD) {
    fillDisplayPercent = fillInsidePercent * 0.5;
  }

  const totalCoveredCells = insideCells.size;
  const totalStrokeArea = totalCoveredCells * cellSize * cellSize;
  const insideStrokeArea = totalCoveredCells * cellSize * cellSize;

  const outsidePercent = outsideRatio * 100;
  const accuracy = totalPoints > 0 ? (insidePoints / totalPoints) * 100 : 0;

  const passesStrict =
    insideCoverage >= STRICT_COVERAGE_MIN && outsideRatio <= STRICT_OUTSIDE_MAX;

  return {
    insideCoverage,
    fillInsidePercent,
    fillDisplayPercent,
    outsideRatio,
    insideRatio,
    insidePoints,
    outsidePoints,
    outsidePercent,
    accuracy,
    totalStrokeArea,
    insideStrokeArea,
    passesStrict,
  };
}
