// Game data for Pencil Control — Slanting Lines module

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
    id: 'intro-slanting-line',
    title: 'Intro to Slanting Lines',
    description: 'Learn about diagonal lines',
    emoji: '↗️',
    color: '#93C5FD',
    duration: '2-3 mins',
  },
  {
    id: 'trace-slanting-line',
    title: 'Trace Slanting Line',
    description: 'Practice tracing diagonal lines',
    emoji: '✏️',
    color: '#FBCFE8',
    duration: '2-3 mins',
  },
  {
    id: 'match-the-slope',
    title: 'Match the Slope',
    description: 'Identify slanting lines',
    emoji: '🔍',
    color: '#A7F3D0',
    duration: '2-3 mins',
  },
  {
    id: 'drag-slanted-sticks',
    title: 'Drag the Slanted Sticks',
    description: 'Sort diagonal lines',
    emoji: '📦',
    color: '#93C5FD',
    duration: '2-3 mins',
  },
];

// Line patterns for tracing (diagonal lines)
export interface LinePattern {
  id: string;
  dots: Array<{ x: number; y: number }>;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  angle: number; // positive = /, negative = \
}

export const LINE_PATTERNS: LinePattern[] = [
  {
    id: 'line-1',
    dots: [
      { x: 100, y: 100 },
      { x: 150, y: 150 },
      { x: 200, y: 200 },
      { x: 250, y: 250 },
      { x: 300, y: 300 },
    ],
    startX: 100,
    startY: 100,
    endX: 300,
    endY: 300,
    angle: 45,
  },
  {
    id: 'line-2',
    dots: [
      { x: 300, y: 100 },
      { x: 250, y: 150 },
      { x: 200, y: 200 },
      { x: 150, y: 250 },
      { x: 100, y: 300 },
    ],
    startX: 300,
    startY: 100,
    endX: 100,
    endY: 300,
    angle: -45,
  },
  {
    id: 'line-3',
    dots: [
      { x: 80, y: 120 },
      { x: 140, y: 180 },
      { x: 200, y: 240 },
      { x: 260, y: 300 },
    ],
    startX: 80,
    startY: 120,
    endX: 260,
    endY: 300,
    angle: 45,
  },
];

// Line types for recognition game
export interface LineType {
  id: string;
  type: 'diagonal' | 'vertical' | 'horizontal';
  angle: number;
  svgPath: string;
}

export const LINE_TYPES: LineType[] = [
  {
    id: 'diagonal-1',
    type: 'diagonal',
    angle: 45,
    svgPath: 'M 100 100 L 300 300',
  },
  {
    id: 'diagonal-2',
    type: 'diagonal',
    angle: -45,
    svgPath: 'M 300 100 L 100 300',
  },
  {
    id: 'vertical-1',
    type: 'vertical',
    angle: 90,
    svgPath: 'M 200 100 L 200 300',
  },
  {
    id: 'horizontal-1',
    type: 'horizontal',
    angle: 0,
    svgPath: 'M 100 200 L 300 200',
  },
];

// Lines for drag game
export interface DraggableLine {
  id: string;
  type: 'diagonal' | 'vertical' | 'horizontal';
  x: number;
  y: number;
  angle: number;
}

export const DRAGGABLE_LINES: DraggableLine[] = [
  { id: 'd1', type: 'diagonal', x: 100, y: 150, angle: 45 },
  { id: 'v1', type: 'vertical', x: 200, y: 150, angle: 90 },
  { id: 'h1', type: 'horizontal', x: 300, y: 150, angle: 0 },
  { id: 'd2', type: 'diagonal', x: 400, y: 150, angle: -45 },
  { id: 'd3', type: 'diagonal', x: 500, y: 150, angle: 45 },
  { id: 'v2', type: 'vertical', x: 600, y: 150, angle: 90 },
  { id: 'h2', type: 'horizontal', x: 700, y: 150, angle: 0 },
  { id: 'd4', type: 'diagonal', x: 800, y: 150, angle: -45 },
];
