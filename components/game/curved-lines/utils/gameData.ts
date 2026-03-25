// Game data for Pencil Control — Curved Lines module

export interface GameInfo {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  duration: string;
}

export const GAMES: GameInfo[] = [
  {
    id: 'intro-curves',
    title: 'Intro to Curves',
    description: 'Learn about curved lines',
    emoji: '🌙',
    color: '#93C5FD',
    duration: '2-3 mins',
  },
  {
    id: 'trace-curved-lines',
    title: 'Trace Curved Lines',
    description: 'Practice tracing curves',
    emoji: '✏️',
    color: '#FBCFE8',
    duration: '2-3 mins',
  },
  {
    id: 'find-curved-shape',
    title: 'Find the Curved Shape',
    description: 'Identify curved lines',
    emoji: '🔍',
    color: '#A7F3D0',
    duration: '2-3 mins',
  },
  {
    id: 'drag-curved-pieces',
    title: 'Drag Curved Pieces',
    description: 'Sort curved shapes',
    emoji: '📦',
    color: '#93C5FD',
    duration: '2-3 mins',
  },
];

// Curve patterns for tracing
export interface CurvePattern {
  id: string;
  dots: Array<{ x: number; y: number }>;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  radius: number;
  type: 'left' | 'right' | 'up' | 'down';
}

export const CURVE_PATTERNS: CurvePattern[] = [
  {
    id: 'curve-1',
    dots: [
      { x: 100, y: 200 },
      { x: 120, y: 180 },
      { x: 150, y: 160 },
      { x: 180, y: 150 },
      { x: 210, y: 160 },
      { x: 240, y: 180 },
      { x: 260, y: 200 },
    ],
    startX: 100,
    startY: 200,
    endX: 260,
    endY: 200,
    radius: 80,
    type: 'up',
  },
  {
    id: 'curve-2',
    dots: [
      { x: 100, y: 200 },
      { x: 120, y: 220 },
      { x: 150, y: 240 },
      { x: 180, y: 250 },
      { x: 210, y: 240 },
      { x: 240, y: 220 },
      { x: 260, y: 200 },
    ],
    startX: 100,
    startY: 200,
    endX: 260,
    endY: 200,
    radius: 80,
    type: 'down',
  },
  {
    id: 'curve-3',
    dots: [
      { x: 200, y: 100 },
      { x: 180, y: 120 },
      { x: 160, y: 150 },
      { x: 150, y: 180 },
      { x: 160, y: 210 },
      { x: 180, y: 240 },
      { x: 200, y: 260 },
    ],
    startX: 200,
    startY: 100,
    endX: 200,
    endY: 260,
    radius: 80,
    type: 'right',
  },
];

// Shape types for recognition game
export interface ShapeType {
  id: string;
  type: 'curved' | 'straight';
  svgPath: string;
  name: string;
}

export const SHAPE_TYPES: ShapeType[] = [
  {
    id: 'curve-left',
    type: 'curved',
    svgPath: 'M 100 200 Q 150 150, 200 200',
    name: 'Curved Left',
  },
  {
    id: 'curve-right',
    type: 'curved',
    svgPath: 'M 100 200 Q 150 250, 200 200',
    name: 'Curved Right',
  },
  {
    id: 'vertical',
    type: 'straight',
    svgPath: 'M 200 100 L 200 300',
    name: 'Vertical',
  },
  {
    id: 'horizontal',
    type: 'straight',
    svgPath: 'M 100 200 L 300 200',
    name: 'Horizontal',
  },
  {
    id: 'diagonal',
    type: 'straight',
    svgPath: 'M 100 100 L 300 300',
    name: 'Diagonal',
  },
];

// Shapes for drag game
export interface DraggableShape {
  id: string;
  type: 'curved' | 'straight';
  x: number;
  y: number;
  svgPath: string;
}

export const DRAGGABLE_SHAPES: DraggableShape[] = [
  { id: 'c1', type: 'curved', x: 100, y: 150, svgPath: 'M 100 200 Q 150 150, 200 200' },
  { id: 's1', type: 'straight', x: 200, y: 150, svgPath: 'M 200 100 L 200 300' },
  { id: 's2', type: 'straight', x: 300, y: 150, svgPath: 'M 100 200 L 300 200' },
  { id: 'c2', type: 'curved', x: 400, y: 150, svgPath: 'M 100 200 Q 150 250, 200 200' },
  { id: 's3', type: 'straight', x: 500, y: 150, svgPath: 'M 100 100 L 300 300' },
  { id: 'c3', type: 'curved', x: 600, y: 150, svgPath: 'M 200 100 Q 250 150, 200 200' },
  { id: 's4', type: 'straight', x: 700, y: 150, svgPath: 'M 300 100 L 100 300' },
  { id: 'c4', type: 'curved', x: 800, y: 150, svgPath: 'M 200 200 Q 250 250, 200 300' },
];
