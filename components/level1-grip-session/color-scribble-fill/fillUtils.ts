import type { Stroke } from '@/components/games/Level1/DrawingCanvas';
import { pathToPoints, pointInPolygon } from '../shapeFillUtils';

export function computeFillRatio(
  strokes: Stroke[],
  shapePolygonCanvas: { x: number; y: number }[],
  brushSize: number,
): number {
  if (shapePolygonCanvas.length < 3) return 0;

  const radius = brushSize;
  const cellSize = Math.max(4, Math.floor(brushSize * 0.6));
  const filledCells = new Set<string>();

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of shapePolygonCanvas) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }

  const markBrushCoverage = (x: number, y: number) => {
    const gxMin = Math.floor((x - radius) / cellSize);
    const gxMax = Math.floor((x + radius) / cellSize);
    const gyMin = Math.floor((y - radius) / cellSize);
    const gyMax = Math.floor((y + radius) / cellSize);
    for (let gx = gxMin; gx <= gxMax; gx++) {
      for (let gy = gyMin; gy <= gyMax; gy++) {
        const cx = gx * cellSize + cellSize / 2;
        const cy = gy * cellSize + cellSize / 2;
        const dx = cx - x;
        const dy = cy - y;
        if (dx * dx + dy * dy > radius * radius) continue;
        if (!pointInPolygon({ x: cx, y: cy }, shapePolygonCanvas)) continue;
        filledCells.add(`${gx},${gy}`);
      }
    }
  };

  for (const stroke of strokes) {
    const points = pathToPoints(stroke.path);
    if (points.length === 0) continue;
    markBrushCoverage(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const steps = Math.max(1, Math.ceil(dist / (cellSize * 0.5)));
      for (let s = 1; s <= steps; s++) {
        const t = s / steps;
        markBrushCoverage(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
      }
    }
  }

  let shapeCellCount = 0;
  const gxMin = Math.floor(minX / cellSize);
  const gxMax = Math.floor(maxX / cellSize);
  const gyMin = Math.floor(minY / cellSize);
  const gyMax = Math.floor(maxY / cellSize);
  for (let gx = gxMin; gx <= gxMax; gx++) {
    for (let gy = gyMin; gy <= gyMax; gy++) {
      const cx = gx * cellSize + cellSize / 2;
      const cy = gy * cellSize + cellSize / 2;
      if (pointInPolygon({ x: cx, y: cy }, shapePolygonCanvas)) {
        shapeCellCount += 1;
      }
    }
  }

  if (shapeCellCount === 0) return 0;
  return Math.min(1, filledCells.size / shapeCellCount);
}

export function pathsToStrokes(paths: { path: string }[], brushSize: number): Stroke[] {
  return paths.map((p) => ({ path: p.path, color: '#000', width: brushSize }));
}
