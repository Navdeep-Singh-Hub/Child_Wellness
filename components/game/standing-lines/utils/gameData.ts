// Game data for Pencil Control — Standing Lines module

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
    id: 'intro-standing-line',
    title: 'Intro to Standing Line',
    description: 'Learn about vertical lines',
    emoji: '📏',
    color: '#93C5FD',
    duration: '2-3 mins',
  },
  {
    id: 'trace-standing-line',
    title: 'Trace the Standing Line',
    description: 'Practice tracing vertical lines',
    emoji: '✏️',
    color: '#FBCFE8',
    duration: '2-3 mins',
  },
  {
    id: 'find-vertical-line',
    title: 'Find the Vertical Line',
    description: 'Identify standing lines',
    emoji: '🔍',
    color: '#A7F3D0',
    duration: '2-3 mins',
  },
  {
    id: 'drag-vertical-lines',
    title: 'Drag the Vertical Lines',
    description: 'Sort vertical lines',
    emoji: '📦',
    color: '#93C5FD',
    duration: '2-3 mins',
  },
];

// Line patterns for tracing
export interface LinePattern {
  id: string;
  dots: Array<{ x: number; y: number }>;
  startY: number;
  endY: number;
  centerX: number;
}

export const LINE_PATTERNS: LinePattern[] = [
  {
    id: 'line-1',
    dots: [
      { x: 200, y: 100 },
      { x: 200, y: 150 },
      { x: 200, y: 200 },
      { x: 200, y: 250 },
      { x: 200, y: 300 },
      { x: 200, y: 350 },
      { x: 200, y: 400 },
    ],
    startY: 100,
    endY: 400,
    centerX: 200,
  },
  {
    id: 'line-2',
    dots: [
      { x: 300, y: 80 },
      { x: 300, y: 130 },
      { x: 300, y: 180 },
      { x: 300, y: 230 },
      { x: 300, y: 280 },
      { x: 300, y: 330 },
      { x: 300, y: 380 },
    ],
    startY: 80,
    endY: 380,
    centerX: 300,
  },
  {
    id: 'line-3',
    dots: [
      { x: 150, y: 120 },
      { x: 150, y: 170 },
      { x: 150, y: 220 },
      { x: 150, y: 270 },
      { x: 150, y: 320 },
      { x: 150, y: 370 },
    ],
    startY: 120,
    endY: 370,
    centerX: 150,
  },
];

// Line types for recognition game
export interface LineType {
  id: string;
  type: 'vertical' | 'horizontal' | 'diagonal';
  angle: number; // 0 = vertical, 90 = horizontal, 45 = diagonal
  svgPath: string;
}

export const LINE_TYPES: LineType[] = [
  {
    id: 'vertical-1',
    type: 'vertical',
    angle: 0,
    svgPath: 'M 200 100 L 200 400',
  },
  {
    id: 'horizontal-1',
    type: 'horizontal',
    angle: 90,
    svgPath: 'M 100 250 L 300 250',
  },
  {
    id: 'diagonal-1',
    type: 'diagonal',
    angle: 45,
    svgPath: 'M 100 100 L 300 400',
  },
  {
    id: 'diagonal-2',
    type: 'diagonal',
    angle: -45,
    svgPath: 'M 300 100 L 100 400',
  },
];

// Lines for drag game
export interface DraggableLine {
  id: string;
  type: 'vertical' | 'horizontal' | 'diagonal';
  x: number;
  y: number;
  angle: number;
}

export const DRAGGABLE_LINES: DraggableLine[] = [
  { id: 'v1', type: 'vertical', x: 100, y: 200, angle: 0 },
  { id: 'h1', type: 'horizontal', x: 200, y: 200, angle: 90 },
  { id: 'd1', type: 'diagonal', x: 300, y: 200, angle: 45 },
  { id: 'v2', type: 'vertical', x: 400, y: 200, angle: 0 },
  { id: 'd2', type: 'diagonal', x: 500, y: 200, angle: -45 },
  { id: 'v3', type: 'vertical', x: 600, y: 200, angle: 0 },
  { id: 'h2', type: 'horizontal', x: 700, y: 200, angle: 90 },
  { id: 'v4', type: 'vertical', x: 800, y: 200, angle: 0 },
];
