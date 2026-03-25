// Game data for Explorer Final Challenge module

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
    id: 'find-letters',
    title: 'Find Letters',
    description: 'Identify letters in a grid',
    emoji: '🔤',
    color: '#93C5FD',
    duration: '3-4 mins',
  },
  {
    id: 'find-numbers',
    title: 'Find Numbers',
    description: 'Identify numbers in a grid',
    emoji: '🔢',
    color: '#FBCFE8',
    duration: '3-4 mins',
  },
  {
    id: 'trace-mixed-letters',
    title: 'Trace Mixed Letters',
    description: 'Practice tracing different letters',
    emoji: '✏️',
    color: '#A7F3D0',
    duration: '3-4 mins',
  },
  {
    id: 'sorting-puzzle',
    title: 'Sorting Puzzle',
    description: 'Sort letters and numbers',
    emoji: '🧩',
    color: '#93C5FD',
    duration: '3-4 mins',
  },
];

// Letters for finding game
export const LETTERS_GRID = [
  ['A', 'B', 'C', 'D'],
  ['E', 'F', 'G', 'H'],
  ['I', 'J', 'K', 'L'],
  ['M', 'N', 'O', 'P'],
  ['Q', 'R', 'S', 'T'],
  ['U', 'V', 'W', 'X'],
  ['Y', 'Z', 'A', 'B'],
];

// Numbers for finding game
export const NUMBERS_GRID = [
  ['1', '2', '3', '4'],
  ['5', '6', '7', '8'],
  ['9', '10', '1', '2'],
  ['3', '4', '5', '6'],
  ['7', '8', '9', '10'],
];

// Letters for tracing
export const TRACE_LETTERS = ['A', 'B', 'C', 'D', 'E'];

// Letter data for tracing
export interface LetterPath {
  letter: string;
  dots: Array<{ x: number; y: number }>;
  svgPath: string;
}

export const LETTER_PATHS: Record<string, LetterPath> = {
  A: {
    letter: 'A',
    dots: [
      { x: 200, y: 300 },
      { x: 150, y: 200 },
      { x: 200, y: 100 },
      { x: 250, y: 200 },
      { x: 200, y: 200 },
      { x: 200, y: 300 },
    ],
    svgPath: 'M 200 300 L 150 200 L 200 100 L 250 200 M 200 200 L 200 300',
  },
  B: {
    letter: 'B',
    dots: [
      { x: 150, y: 100 },
      { x: 150, y: 300 },
      { x: 200, y: 300 },
      { x: 200, y: 200 },
      { x: 150, y: 200 },
      { x: 200, y: 200 },
      { x: 200, y: 100 },
      { x: 150, y: 100 },
    ],
    svgPath: 'M 150 100 L 150 300 L 200 300 L 200 200 L 150 200 M 200 200 L 200 100 L 150 100',
  },
  C: {
    letter: 'C',
    dots: [
      { x: 250, y: 100 },
      { x: 200, y: 100 },
      { x: 150, y: 200 },
      { x: 200, y: 300 },
      { x: 250, y: 300 },
    ],
    svgPath: 'M 250 100 Q 200 100, 150 200 Q 200 300, 250 300',
  },
  D: {
    letter: 'D',
    dots: [
      { x: 150, y: 100 },
      { x: 150, y: 300 },
      { x: 200, y: 300 },
      { x: 250, y: 200 },
      { x: 200, y: 100 },
      { x: 150, y: 100 },
    ],
    svgPath: 'M 150 100 L 150 300 L 200 300 Q 250 200, 200 100 L 150 100',
  },
  E: {
    letter: 'E',
    dots: [
      { x: 150, y: 100 },
      { x: 150, y: 300 },
      { x: 250, y: 300 },
      { x: 150, y: 200 },
      { x: 250, y: 200 },
      { x: 150, y: 100 },
      { x: 250, y: 100 },
    ],
    svgPath: 'M 150 100 L 150 300 L 250 300 M 150 200 L 250 200 M 150 100 L 250 100',
  },
};

// Sorting items
export interface SortItem {
  id: string;
  type: 'letter' | 'number';
  value: string;
  emoji?: string;
}

export const SORT_ITEMS: SortItem[] = [
  { id: 'A', type: 'letter', value: 'A' },
  { id: '1', type: 'number', value: '1' },
  { id: 'B', type: 'letter', value: 'B' },
  { id: '2', type: 'number', value: '2' },
  { id: 'C', type: 'letter', value: 'C' },
  { id: '3', type: 'number', value: '3' },
  { id: 'D', type: 'letter', value: 'D' },
  { id: '4', type: 'number', value: '4' },
  { id: 'E', type: 'letter', value: 'E' },
  { id: '5', type: 'number', value: '5' },
];
