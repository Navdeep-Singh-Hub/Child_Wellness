/**
 * Mirror drawing helpers for OT Level 2 Session 10.
 */
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

export const mirrorX = (x: number, axis = MX) => axis + (axis - x);

export const pathToSvg = (path: Point[]) => {
  if (path.length === 0) return '';
  if (path.length === 1) return `M ${path[0]!.x} ${path[0]!.y}`;
  return `M ${path[0]!.x} ${path[0]!.y} ${path.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')}`;
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

export const halfShapePath = (type: HalfShapeKind, axis = MX): string => {
  const cy = 50;
  switch (type) {
    case 'circle':
      return `M ${axis} ${cy - 15} A 15 15 0 0 1 ${axis} ${cy + 15}`;
    case 'square':
      return `M ${axis} ${cy - 15} L ${axis} ${cy + 15} L ${axis - 15} ${cy + 15} L ${axis - 15} ${cy - 15} Z`;
    case 'triangle':
      return `M ${axis} ${cy - 15} L ${axis - 15} ${cy + 15} L ${axis} ${cy + 15} Z`;
    case 'heart':
      return `M ${axis} ${cy - 10} Q ${axis - 10} ${cy - 10} ${axis - 10} ${cy} Q ${axis - 10} ${cy + 5} ${axis} ${cy + 10}`;
    default:
      return '';
  }
};

export const randomHalfShape = (): HalfShapeKind => {
  const shapes: HalfShapeKind[] = ['circle', 'square', 'triangle', 'heart'];
  return shapes[Math.floor(Math.random() * shapes.length)]!;
};

export { useTraceSound } from '@/components/game/occupational/level2/session2/traceUtils';
