// Game data for Numbers 1–5 module

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
    id: 'number-introduction',
    title: 'Number Introduction',
    description: 'Learn numbers 1–5',
    emoji: '🔢',
    color: '#93C5FD',
    duration: '2-3 mins',
  },
  {
    id: 'count-the-objects',
    title: 'Count the Objects',
    description: 'Count and identify',
    emoji: '🍎',
    color: '#FBCFE8',
    duration: '2-3 mins',
  },
  {
    id: 'trace-the-number',
    title: 'Trace the Number',
    description: 'Practice writing numbers',
    emoji: '✏️',
    color: '#A7F3D0',
    duration: '2-3 mins',
  },
  {
    id: 'match-number-to-objects',
    title: 'Match Number to Objects',
    description: 'Connect numbers to quantities',
    emoji: '⭐',
    color: '#93C5FD',
    duration: '2-3 mins',
  },
];

// Number data
export interface NumberData {
  number: number;
  name: string;
  dots: Array<{ x: number; y: number }>;
  svgPath: string;
  emoji: string;
}

export const NUMBERS: NumberData[] = [
  {
    number: 1,
    name: 'One',
    dots: [
      { x: 200, y: 100 },
      { x: 200, y: 150 },
      { x: 200, y: 200 },
      { x: 200, y: 250 },
      { x: 200, y: 300 },
    ],
    svgPath: 'M 200 100 L 200 300',
    emoji: '🍎',
  },
  {
    number: 2,
    name: 'Two',
    dots: [
      { x: 150, y: 100 },
      { x: 200, y: 100 },
      { x: 250, y: 150 },
      { x: 200, y: 200 },
      { x: 150, y: 250 },
      { x: 200, y: 300 },
    ],
    svgPath: 'M 150 100 Q 200 100, 250 150 Q 200 200, 150 250 L 200 300',
    emoji: '🍎',
  },
  {
    number: 3,
    name: 'Three',
    dots: [
      { x: 150, y: 100 },
      { x: 200, y: 100 },
      { x: 250, y: 150 },
      { x: 200, y: 200 },
      { x: 250, y: 250 },
      { x: 200, y: 300 },
    ],
    svgPath: 'M 150 100 Q 200 100, 250 150 Q 200 200, 250 250 L 200 300',
    emoji: '🍎',
  },
  {
    number: 4,
    name: 'Four',
    dots: [
      { x: 150, y: 100 },
      { x: 150, y: 200 },
      { x: 250, y: 100 },
      { x: 250, y: 200 },
      { x: 200, y: 200 },
      { x: 200, y: 300 },
    ],
    svgPath: 'M 150 100 L 150 200 L 250 100 L 250 200 M 200 200 L 200 300',
    emoji: '🍎',
  },
  {
    number: 5,
    name: 'Five',
    dots: [
      { x: 200, y: 100 },
      { x: 150, y: 100 },
      { x: 150, y: 200 },
      { x: 200, y: 200 },
      { x: 250, y: 250 },
      { x: 200, y: 300 },
    ],
    svgPath: 'M 200 100 L 150 100 L 150 200 L 200 200 L 250 250 L 200 300',
    emoji: '🍎',
  },
];

// Counting objects data
export interface CountingObject {
  id: string;
  emoji: string;
  count: number;
  options: number[];
}

export const COUNTING_OBJECTS: CountingObject[] = [
  { id: 'apples-1', emoji: '🍎', count: 1, options: [1, 2, 3] },
  { id: 'apples-2', emoji: '🍎', count: 2, options: [1, 2, 3] },
  { id: 'apples-3', emoji: '🍎', count: 3, options: [2, 3, 4] },
  { id: 'stars-1', emoji: '⭐', count: 1, options: [1, 2, 3] },
  { id: 'stars-2', emoji: '⭐', count: 2, options: [1, 2, 3] },
  { id: 'stars-3', emoji: '⭐', count: 3, options: [2, 3, 4] },
  { id: 'stars-4', emoji: '⭐', count: 4, options: [3, 4, 5] },
  { id: 'stars-5', emoji: '⭐', count: 5, options: [3, 4, 5] },
];

// Object groups for matching
export interface ObjectGroup {
  id: string;
  emoji: string;
  count: number;
  correctNumber: number;
}

export const OBJECT_GROUPS: ObjectGroup[] = [
  { id: 'group-1', emoji: '⭐', count: 1, correctNumber: 1 },
  { id: 'group-2', emoji: '⭐', count: 2, correctNumber: 2 },
  { id: 'group-3', emoji: '⭐', count: 3, correctNumber: 3 },
  { id: 'group-4', emoji: '⭐', count: 4, correctNumber: 4 },
  { id: 'group-5', emoji: '⭐', count: 5, correctNumber: 5 },
];
