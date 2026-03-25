// Game data for Pencil Control — Sleeping Lines module

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
    id: 'intro-sleeping-line',
    title: 'Intro to Sleeping Line',
    description: 'Learn about horizontal lines',
    emoji: '➖',
    color: '#93C5FD',
    duration: '2-3 mins',
  },
  {
    id: 'trace-sleeping-line',
    title: 'Trace the Sleeping Line',
    description: 'Practice tracing horizontal lines',
    emoji: '✏️',
    color: '#FBCFE8',
    duration: '2-3 mins',
  },
  {
    id: 'find-correct-line',
    title: 'Find the Correct Line',
    description: 'Identify sleeping lines',
    emoji: '🔍',
    color: '#A7F3D0',
    duration: '2-3 mins',
  },
  {
    id: 'match-sleeping-lines',
    title: 'Match the Sleeping Lines',
    description: 'Sort horizontal lines',
    emoji: '📦',
    color: '#93C5FD',
    duration: '2-3 mins',
  },
];

// Line patterns for tracing (horizontal lines)
export interface LinePattern {
  id: string;
  dots: Array<{ x: number; y: number }>;
  startX: number;
  endX: number;
  centerY: number;
}

export const LINE_PATTERNS: LinePattern[] = [
  {
    id: 'line-1',
    dots: [
      { x: 100, y: 200 },
      { x: 150, y: 200 },
      { x: 200, y: 200 },
      { x: 250, y: 200 },
      { x: 300, y: 200 },
      { x: 350, y: 200 },
      { x: 400, y: 200 },
    ],
    startX: 100,
    endX: 400,
    centerY: 200,
  },
  {
    id: 'line-2',
    dots: [
      { x: 80, y: 250 },
      { x: 130, y: 250 },
      { x: 180, y: 250 },
      { x: 230, y: 250 },
      { x: 280, y: 250 },
      { x: 330, y: 250 },
      { x: 380, y: 250 },
    ],
    startX: 80,
    endX: 380,
    centerY: 250,
  },
  {
    id: 'line-3',
    dots: [
      { x: 120, y: 300 },
      { x: 170, y: 300 },
      { x: 220, y: 300 },
      { x: 270, y: 300 },
      { x: 320, y: 300 },
      { x: 370, y: 300 },
    ],
    startX: 120,
    endX: 370,
    centerY: 300,
  },
];

// Line types for recognition game
export interface LineType {
  id: string;
  type: 'horizontal' | 'vertical' | 'diagonal';
  angle: number;
  svgPath: string;
}

export const LINE_TYPES: LineType[] = [
  {
    id: 'horizontal-1',
    type: 'horizontal',
    angle: 0,
    svgPath: 'M 100 200 L 300 200',
  },
  {
    id: 'vertical-1',
    type: 'vertical',
    angle: 90,
    svgPath: 'M 200 100 L 200 300',
  },
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
];

// Lines for drag game
export interface DraggableLine {
  id: string;
  type: 'horizontal' | 'vertical' | 'diagonal';
  x: number;
  y: number;
  angle: number;
}

export const DRAGGABLE_LINES: DraggableLine[] = [
  { id: 'h1', type: 'horizontal', x: 100, y: 150, angle: 0 },
  { id: 'v1', type: 'vertical', x: 200, y: 150, angle: 90 },
  { id: 'd1', type: 'diagonal', x: 300, y: 150, angle: 45 },
  { id: 'h2', type: 'horizontal', x: 400, y: 150, angle: 0 },
  { id: 'd2', type: 'diagonal', x: 500, y: 150, angle: -45 },
  { id: 'h3', type: 'horizontal', x: 600, y: 150, angle: 0 },
  { id: 'v2', type: 'vertical', x: 700, y: 150, angle: 90 },
  { id: 'h4', type: 'horizontal', x: 800, y: 150, angle: 0 },
];
