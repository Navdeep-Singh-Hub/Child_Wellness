import { Point } from '@/components/game/occupational/level2/session3/traceUtils';

export type { Point };
export { buildPolylinePaths, distanceToPolyline, progressOnPolyline, useTraceSound } from '@/components/game/occupational/level2/session3/traceUtils';

export const makeWavyTrail = (): Point[] => {
  const startX = 20; const startY = 50; const endX = 80; const endY = 50;
  const pts: Point[] = [{ x: startX, y: startY }];
  for (let i = 1; i < 8; i++) {
    const t = i / 8;
    pts.push({ x: startX + (endX - startX) * t, y: startY + Math.sin(t * Math.PI * 3) * 15 });
  }
  pts.push({ x: endX, y: endY });
  return pts;
};

export const makeMazePath = (): Point[] => [
  { x: 20, y: 50 }, { x: 40, y: 50 }, { x: 40, y: 65 }, { x: 60, y: 65 },
  { x: 60, y: 35 }, { x: 80, y: 35 }, { x: 80, y: 50 },
];

export const makeWindingPath = (): Point[] => [
  { x: 20, y: 50 }, { x: 30, y: 45 }, { x: 40, y: 55 }, { x: 50, y: 40 },
  { x: 60, y: 60 }, { x: 70, y: 45 }, { x: 80, y: 50 },
];

export const makeCurvedRollPath = (): Point[] => {
  const startX = 20; const startY = 70; const endX = 80; const endY = 30;
  const pts: Point[] = [{ x: startX, y: startY }];
  for (let i = 1; i < 6; i++) {
    const t = i / 6;
    pts.push({
      x: startX + (endX - startX) * t,
      y: startY + (endY - startY) * t + Math.sin(t * Math.PI) * 10,
    });
  }
  pts.push({ x: endX, y: endY });
  return pts;
};

export const makeRiverPath = (): Point[] => [
  { x: 20, y: 80 }, { x: 30, y: 70 }, { x: 40, y: 60 }, { x: 50, y: 50 },
  { x: 60, y: 40 }, { x: 70, y: 30 }, { x: 80, y: 20 },
];

export const dotsFromPolyline = (points: Point[], spacing: number): Point[] => {
  const dots: Point[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const count = Math.max(1, Math.floor(len / spacing));
    for (let j = 0; j < count; j++) {
      const t = j / count;
      dots.push({ x: p1.x + (p2.x - p1.x) * t, y: p1.y + (p2.y - p1.y) * t });
    }
  }
  if (points.length) dots.push(points[points.length - 1]);
  return dots;
};

export const distanceToDots = (px: number, py: number, dots: Point[]) => {
  let min = Infinity;
  for (const d of dots) min = Math.min(min, Math.hypot(px - d.x, py - d.y));
  return min;
};
