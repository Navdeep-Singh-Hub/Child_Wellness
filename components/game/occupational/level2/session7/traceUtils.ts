/**
 * Trace math helpers for OT Level 2 Session 7 large-shape games.
 */
export type Point = { x: number; y: number };

export type PaintShapeKind = 'star' | 'heart' | 'pentagon';

export type TraceShapeKind = 'circle' | 'square' | 'triangle' | PaintShapeKind;

export const distanceToSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
};

export const distanceToPolygon = (px: number, py: number, points: Point[]) => {
  let min = Infinity;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i]!;
    const p2 = points[(i + 1) % points.length]!;
    min = Math.min(min, distanceToSegment(px, py, p1.x, p1.y, p2.x, p2.y));
  }
  return min;
};

export const distanceToFullCircle = (px: number, py: number, cx: number, cy: number, r: number) =>
  Math.abs(Math.hypot(px - cx, py - cy) - r);

export const circleTraceProgress = (px: number, py: number, cx: number, cy: number, startAngle: number) => {
  let angle = Math.atan2(py - cy, px - cx);
  if (angle < 0) angle += 2 * Math.PI;
  let normalized = angle - startAngle;
  if (normalized < 0) normalized += 2 * Math.PI;
  return normalized / (2 * Math.PI);
};

export const polygonTraceProgress = (px: number, py: number, points: Point[]) => {
  const segmentDists: number[] = [];
  let total = 0;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i]!;
    const p2 = points[(i + 1) % points.length]!;
    const seg = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    segmentDists.push(seg);
    total += seg;
  }
  if (total === 0) return 0;

  let bestDist = Infinity;
  let bestSeg = 0;
  let bestT = 0;
  for (let i = 0; i < points.length; i++) {
    const p1 = points[i]!;
    const p2 = points[(i + 1) % points.length]!;
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) continue;
    const t = Math.max(0, Math.min(1, ((px - p1.x) * dx + (py - p1.y) * dy) / lenSq));
    const dist = Math.hypot(px - (p1.x + t * dx), py - (p1.y + t * dy));
    if (dist < bestDist) {
      bestDist = dist;
      bestSeg = i;
      bestT = t;
    }
  }
  const along = segmentDists.slice(0, bestSeg).reduce((a, b) => a + b, 0) + segmentDists[bestSeg]! * bestT;
  return along / total;
};

export const advanceTraceProgress = (current: number, last: number, stored: number) => {
  const diff = current - last;
  if (current < 0.1 && last > 0.9) return Math.min(1, current + 1);
  if (diff > -0.05) return Math.min(1, Math.max(stored, current));
  return stored;
};

export const buildFullCirclePaths = (cx: number, cy: number, r: number, startAngle: number, progress: number) => {
  const sx = cx + r * Math.cos(startAngle);
  const sy = cy + r * Math.sin(startAngle);
  const ex = cx + r * Math.cos(startAngle + 2 * Math.PI);
  const ey = cy + r * Math.sin(startAngle + 2 * Math.PI);
  const full = `M ${sx} ${sy} A ${r} ${r} 0 1 1 ${ex} ${ey} A ${r} ${r} 0 1 1 ${sx} ${sy}`;
  if (progress <= 0) return { full, progressPath: '' };
  const ca = startAngle + 2 * Math.PI * progress;
  const px = cx + r * Math.cos(ca);
  const py = cy + r * Math.sin(ca);
  return { full, progressPath: `M ${sx} ${sy} A ${r} ${r} 0 ${progress > 0.5 ? 1 : 0} 1 ${px} ${py}` };
};

export const buildPolygonStrokePath = (points: Point[], progress: number) => {
  if (points.length < 2) return { full: '', progressPath: '' };
  const full = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  if (progress <= 0) return { full, progressPath: '' };
  const n = points.length;
  let prog = `M ${points[0]!.x} ${points[0]!.y}`;
  for (let i = 0; i < n; i++) {
    const segProg = Math.min(1, (progress - i / n) / (1 / n));
    if (segProg <= 0) break;
    const start = points[i]!;
    const end = points[(i + 1) % n]!;
    if (segProg >= 1) prog += ` L ${end.x} ${end.y}`;
    else prog += ` L ${start.x + (end.x - start.x) * segProg} ${start.y + (end.y - start.y) * segProg}`;
  }
  return { full, progressPath: prog };
};

export const buildPaintFillPath = (points: Point[], progress: number) => {
  if (points.length < 2) return { full: '', fillPath: '' };
  const full = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  if (progress <= 0) return { full, fillPath: '' };
  const n = points.length;
  const toFill = Math.floor(progress * n);
  if (toFill <= 0) return { full, fillPath: '' };
  let fill = `M ${points[0]!.x} ${points[0]!.y}`;
  for (let i = 1; i <= toFill; i++) {
    const idx = i % n;
    fill += ` L ${points[idx]!.x} ${points[idx]!.y}`;
  }
  if (progress >= 0.95) fill += ' Z';
  return { full, fillPath: fill };
};

export const makeSquarePoints = (cx: number, cy: number, size: number): Point[] => [
  { x: cx - size / 2, y: cy - size / 2 },
  { x: cx + size / 2, y: cy - size / 2 },
  { x: cx + size / 2, y: cy + size / 2 },
  { x: cx - size / 2, y: cy + size / 2 },
];

export const makeTrianglePoints = (cx: number, cy: number, size: number): Point[] => [
  { x: cx, y: cy - size / 2 },
  { x: cx + size / 2, y: cy + size / 2 },
  { x: cx - size / 2, y: cy + size / 2 },
];

export const buildPaintShape = (type: PaintShapeKind, cx: number, cy: number, size: number) => {
  const points: Point[] = [];
  if (type === 'star' || type === 'pentagon') {
    const sides = type === 'star' ? 5 : 5;
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
      points.push({ x: cx + (size / 2) * Math.cos(angle), y: cy + (size / 2) * Math.sin(angle) });
    }
    const full = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
    return { points, full };
  }
  points.push(
    { x: cx, y: cy + size / 4 },
    { x: cx - size / 3, y: cy - size / 6 },
    { x: cx - size / 6, y: cy - size / 3 },
    { x: cx, y: cy - size / 6 },
    { x: cx + size / 6, y: cy - size / 3 },
    { x: cx + size / 3, y: cy - size / 6 },
  );
  const full = `M ${points[0]!.x} ${points[0]!.y} C ${points[1]!.x} ${points[1]!.y} ${points[2]!.x} ${points[2]!.y} ${points[3]!.x} ${points[3]!.y} C ${points[4]!.x} ${points[4]!.y} ${points[5]!.x} ${points[5]!.y} ${points[0]!.x} ${points[0]!.y} Z`;
  return { points, full };
};

export { useTraceSound } from '@/components/game/occupational/level2/session2/traceUtils';
