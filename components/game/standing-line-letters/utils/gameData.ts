// Game data for Capital Letters — Standing Line Letters module

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
    id: 'letter-introduction',
    title: 'Letter Introduction',
    description: 'Learn about the letter I',
    emoji: '🔤',
    color: '#93C5FD',
    duration: '2-3 mins',
  },
  {
    id: 'tap-the-letter',
    title: 'Tap the Letter',
    description: 'Identify the letter I',
    emoji: '👆',
    color: '#FBCFE8',
    duration: '2-3 mins',
  },
  {
    id: 'trace-the-letter',
    title: 'Trace the Letter',
    description: 'Practice tracing letter I',
    emoji: '✏️',
    color: '#A7F3D0',
    duration: '2-3 mins',
  },
  {
    id: 'find-the-letter',
    title: 'Find the Letter',
    description: 'Find all letter I in grid',
    emoji: '🔍',
    color: '#93C5FD',
    duration: '2-3 mins',
  },
];

// Letter data
export interface LetterData {
  letter: string;
  name: string;
  strokes: Array<{ startX: number; startY: number; endX: number; endY: number }>;
  svgPath: string;
  dots: Array<{ x: number; y: number }>;
}

export const LETTER_I: LetterData = {
  letter: 'I',
  name: 'I',
  strokes: [
    { startX: 200, startY: 100, endX: 200, endY: 300 },
  ],
  svgPath: 'M 200 100 L 200 300',
  dots: [
    { x: 200, y: 100 },
    { x: 200, y: 150 },
    { x: 200, y: 200 },
    { x: 200, y: 250 },
    { x: 200, y: 300 },
  ],
};

export const LETTER_L: LetterData = {
  letter: 'L',
  name: 'L',
  strokes: [
    { startX: 150, startY: 100, endX: 150, endY: 300 },
    { startX: 150, startY: 300, endX: 250, endY: 300 },
  ],
  svgPath: 'M 150 100 L 150 300 L 250 300',
  dots: [
    { x: 150, y: 100 },
    { x: 150, y: 150 },
    { x: 150, y: 200 },
    { x: 150, y: 250 },
    { x: 150, y: 300 },
    { x: 200, y: 300 },
    { x: 250, y: 300 },
  ],
};

export const LETTER_T: LetterData = {
  letter: 'T',
  name: 'T',
  strokes: [
    { startX: 100, startY: 100, endX: 300, endY: 100 },
    { startX: 200, startY: 100, endX: 200, endY: 300 },
  ],
  svgPath: 'M 100 100 L 300 100 M 200 100 L 200 300',
  dots: [
    { x: 100, y: 100 },
    { x: 200, y: 100 },
    { x: 300, y: 100 },
    { x: 200, y: 150 },
    { x: 200, y: 200 },
    { x: 200, y: 250 },
    { x: 200, y: 300 },
  ],
};

export const LETTER_H: LetterData = {
  letter: 'H',
  name: 'H',
  strokes: [
    { startX: 100, startY: 100, endX: 100, endY: 300 },
    { startX: 300, startY: 100, endX: 300, endY: 300 },
    { startX: 100, startY: 200, endX: 300, endY: 200 },
  ],
  svgPath: 'M 100 100 L 100 300 M 300 100 L 300 300 M 100 200 L 300 200',
  dots: [
    { x: 100, y: 100 },
    { x: 100, y: 150 },
    { x: 100, y: 200 },
    { x: 200, y: 200 },
    { x: 300, y: 200 },
    { x: 300, y: 150 },
    { x: 300, y: 100 },
    { x: 300, y: 250 },
    { x: 300, y: 300 },
    { x: 100, y: 250 },
    { x: 100, y: 300 },
  ],
};

// Letters for recognition game
export const RECOGNITION_LETTERS = [
  { letter: 'I', data: LETTER_I },
  { letter: 'L', data: LETTER_L },
  { letter: 'T', data: LETTER_T },
  { letter: 'H', data: LETTER_H },
];

// Grid for find the letter game
export const LETTER_GRID = [
  ['I', 'L', 'I', 'T'],
  ['H', 'I', 'L', 'T'],
  ['I', 'T', 'I', 'H'],
  ['L', 'I', 'T', 'I'],
];
