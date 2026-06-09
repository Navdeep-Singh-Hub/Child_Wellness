/**
 * Mirror drawing helpers for OT Level 2 Session 10.
 */
import { distanceToPolygon } from '@/components/game/occupational/level2/session7/traceUtils';

export type Point = { x: number; y: number };

export type HalfShapeKind = 'circle' | 'square' | 'triangle' | 'heart';

export type MazeRound = {
  startX: number;
  startY: number;
  goalX: number;
  goalY: number;
  path: Point[];
};

const MX = 50;
const CY = 50;
const R = 15;

export const mirrorX = (x: number, axis = MX) => axis + (axis - x);

export const pathToSvg = (path: Point[]) => {
  if (path.length === 0) return '';
  if (path.length === 1) return `M ${path[0]!.x} ${path[0]!.y}`;
  return `M ${path[0]!.x} ${path[0]!.y} ${path.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')}`;
};

export const pathLength = (path: Point[]) => {
  let len = 0;
  for (let i = 1; i < path.length; i++) {
    len += Math.hypot(path[i]!.x - path[i - 1]!.x, path[i]!.y - path[i - 1]!.y);
  }
  return len;
};

export const mirrorPath = (path: Point[], axis = MX): Point[] =>
  path.map((p) => ({ x: mirrorX(p.x, axis), y: p.y }));

export const generateMaze = (): MazeRound => {
  const startY = 20;
  const goalY = 80;
  return {
    startX: 20,
    startY,
    goalX: 20,
    goalY,
    path: [
      { x: 20, y: startY },
      { x: 30, y: 30 },
      { x: 25, y: 40 },
      { x: 35, y: 50 },
      { x: 25, y: 60 },
      { x: 30, y: 70 },
      { x: 20, y: goalY },
    ],
  };
};

export const mazePathSvg = (path: Point[]) => pathToSvg(path);

/** Left-half guide shown on the mirror line */
export const halfShapePath = (type: HalfShapeKind, axis = MX): string => {
  const cy = CY;
  const r = R;
  switch (type) {
    case 'circle':
      return `M ${axis} ${cy - r} A ${r} ${r} 0 0 1 ${axis} ${cy + r}`;
    case 'square':
      return `M ${axis} ${cy - r} L ${axis - r} ${cy - r} L ${axis - r} ${cy + r} L ${axis} ${cy + r} Z`;
    case 'triangle':
      return `M ${axis} ${cy - r} L ${axis - r} ${cy + r} L ${axis} ${cy + r} Z`;
    case 'heart':
      return `M ${axis} ${cy - 10} Q ${axis - 10} ${cy - 10} ${axis - 10} ${cy} Q ${axis - 10} ${cy + 5} ${axis} ${cy + 10}`;
    default:
      return '';
  }
};

/** Dotted target outline on the right side */
export const rightHalfGuidePath = (type: HalfShapeKind, axis = MX): string => {
  const cy = CY;
  const r = R;
  switch (type) {
    case 'circle':
      return `M ${axis} ${cy - r} A ${r} ${r} 0 0 0 ${axis} ${cy + r}`;
    case 'square':
      return `M ${axis} ${cy - r} L ${axis + r} ${cy - r} L ${axis + r} ${cy + r} L ${axis} ${cy + r} Z`;
    case 'triangle':
      return `M ${axis} ${cy - r} L ${axis + r} ${cy + r} L ${axis} ${cy + r} Z`;
    case 'heart':
      return `M ${axis} ${cy - 10} Q ${axis + 10} ${cy - 10} ${axis + 10} ${cy} Q ${axis + 10} ${cy + 5} ${axis} ${cy + 10}`;
    default:
      return '';
  }
};

export const rightHalfShapePoints = (type: HalfShapeKind, axis = MX): Point[] => {
  const cy = CY;
  const r = R;
  switch (type) {
    case 'circle': {
      const pts: Point[] = [];
      for (let i = 0; i <= 24; i++) {
        const angle = -Math.PI / 2 + (Math.PI * i) / 24;
        pts.push({ x: axis + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
      }
      return pts;
    }
    case 'square':
      return [
        { x: axis, y: cy - r },
        { x: axis + r, y: cy - r },
        { x: axis + r, y: cy + r },
        { x: axis, y: cy + r },
        { x: axis, y: cy - r },
      ];
    case 'triangle':
      return [
        { x: axis, y: cy - r },
        { x: axis + r, y: cy + r },
        { x: axis, y: cy + r },
        { x: axis, y: cy - r },
      ];
    case 'heart':
      return [
        { x: axis, y: cy - 10 },
        { x: axis + 8, y: cy - 8 },
        { x: axis + 10, y: cy },
        { x: axis + 8, y: cy + 6 },
        { x: axis, y: cy + 10 },
      ];
    default:
      return [];
  }
};

export const validateHalfTrace = (userPath: Point[], shape: HalfShapeKind, tolerance: number, coverageThreshold: number) => {
  const guide = rightHalfShapePoints(shape);
  if (userPath.length < 4 || guide.length === 0) return false;
  let covered = 0;
  for (const g of guide) {
    if (userPath.some((p) => Math.hypot(p.x - g.x, p.y - g.y) <= tolerance)) covered++;
  }
  return covered / guide.length >= coverageThreshold;
};

export const isOnMazePath = (x: number, y: number, path: Point[], tolerance: number) =>
  distanceToPolygon(x, y, path) <= tolerance;

export const randomHalfShape = (): HalfShapeKind => {
  const shapes: HalfShapeKind[] = ['circle', 'square', 'triangle', 'heart'];
  return shapes[Math.floor(Math.random() * shapes.length)]!;
};

export { useTraceSound } from '@/components/game/occupational/level2/session2/traceUtils';
