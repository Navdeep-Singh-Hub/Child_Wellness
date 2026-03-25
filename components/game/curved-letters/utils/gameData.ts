// Game data for Capital Letters — Curved Letters module

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
    description: 'Learn about the letter C',
    emoji: '🔤',
    color: '#93C5FD',
    duration: '2-3 mins',
  },
  {
    id: 'tap-correct-letter',
    title: 'Tap the Correct Letter',
    description: 'Identify the letter C',
    emoji: '👆',
    color: '#FBCFE8',
    duration: '2-3 mins',
  },
  {
    id: 'trace-the-letter',
    title: 'Trace the Letter',
    description: 'Practice tracing letter C',
    emoji: '✏️',
    color: '#A7F3D0',
    duration: '2-3 mins',
  },
  {
    id: 'match-curved-letters',
    title: 'Match Curved Letters',
    description: 'Sort curved letters',
    emoji: '📦',
    color: '#93C5FD',
    duration: '2-3 mins',
  },
];

// Letter data
export interface LetterData {
  letter: string;
  name: string;
  strokes: Array<{ startX: number; startY: number; endX: number; endY: number; controlX?: number; controlY?: number }>;
  svgPath: string;
  dots: Array<{ x: number; y: number }>;
  isCurved: boolean;
}

export const LETTER_C: LetterData = {
  letter: 'C',
  name: 'C',
  strokes: [
    { startX: 250, startY: 100, endX: 150, endY: 200, controlX: 200, controlY: 100 },
    { startX: 150, startY: 200, endX: 250, endY: 300, controlX: 200, controlY: 300 },
  ],
  svgPath: 'M 250 100 Q 200 100, 150 200 Q 200 300, 250 300',
  dots: [
    { x: 250, y: 100 },
    { x: 220, y: 120 },
    { x: 180, y: 150 },
    { x: 150, y: 200 },
    { x: 180, y: 250 },
    { x: 220, y: 280 },
    { x: 250, y: 300 },
  ],
  isCurved: true,
};

export const LETTER_O: LetterData = {
  letter: 'O',
  name: 'O',
  strokes: [
    { startX: 200, startY: 100, endX: 200, endY: 100, controlX: 200, controlY: 200 },
  ],
  svgPath: 'M 200 100 Q 100 100, 100 200 Q 100 300, 200 300 Q 300 300, 300 200 Q 300 100, 200 100',
  dots: [
    { x: 200, y: 100 },
    { x: 100, y: 100 },
    { x: 100, y: 200 },
    { x: 100, y: 300 },
    { x: 200, y: 300 },
    { x: 300, y: 300 },
    { x: 300, y: 200 },
    { x: 300, y: 100 },
    { x: 200, y: 100 },
  ],
  isCurved: true,
};

export const LETTER_G: LetterData = {
  letter: 'G',
  name: 'G',
  strokes: [],
  svgPath: 'M 200 100 L 200 300',
  dots: [],
  isCurved: false,
};

export const LETTER_D: LetterData = {
  letter: 'D',
  name: 'D',
  strokes: [],
  svgPath: 'M 150 100 L 150 300',
  dots: [],
  isCurved: false,
};

export const LETTER_I: LetterData = {
  letter: 'I',
  name: 'I',
  strokes: [],
  svgPath: 'M 200 100 L 200 300',
  dots: [],
  isCurved: false,
};

export const LETTER_L: LetterData = {
  letter: 'L',
  name: 'L',
  strokes: [],
  svgPath: 'M 150 100 L 150 300 L 250 300',
  dots: [],
  isCurved: false,
};

export const LETTER_Q: LetterData = {
  letter: 'Q',
  name: 'Q',
  strokes: [],
  svgPath: 'M 200 100 Q 100 100, 100 200 Q 100 300, 200 300 Q 300 300, 300 200 Q 300 100, 200 100',
  dots: [],
  isCurved: true,
};

// Letters for recognition game
export const RECOGNITION_LETTERS = [
  { letter: 'C', data: LETTER_C },
  { letter: 'O', data: LETTER_O },
  { letter: 'G', data: LETTER_G },
  { letter: 'D', data: LETTER_D },
];

// Letters for drag game
export const DRAGGABLE_LETTERS = [
  { letter: 'C', data: LETTER_C },
  { letter: 'I', data: LETTER_I },
  { letter: 'O', data: LETTER_O },
  { letter: 'L', data: LETTER_L },
  { letter: 'Q', data: LETTER_Q },
];
