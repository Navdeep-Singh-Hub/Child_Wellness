// Game data for The Builder - Level 3 Session 2

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
    id: 'word-intro',
    title: 'Word Introduction',
    description: 'Learn the word BAT',
    emoji: '🔤',
    color: '#6C9EFF',
    duration: '2-3 mins',
  },
  {
    id: 'choose-word',
    title: 'Choose the Word',
    description: 'Identify the word BAT',
    emoji: '👆',
    color: '#FFB6C1',
    duration: '2-3 mins',
  },
  {
    id: 'build-word',
    title: 'Build the Word',
    description: 'Arrange letters to spell BAT',
    emoji: '🧩',
    color: '#7FE7CC',
    duration: '3-4 mins',
  },
  {
    id: 'shape-match',
    title: 'Shape Match',
    description: 'Match square objects',
    emoji: '⬜',
    color: '#6C9EFF',
    duration: '2-3 mins',
  },
];

// Word data
export const WORD_BAT = {
  letters: ['B', 'A', 'T'],
  word: 'BAT',
  image: '🦇',
  pronunciation: 'bat',
};

// Word options for choosing game
export const WORD_OPTIONS = [
  { word: 'BAT', image: '🦇' },
  { word: 'CAT', image: '🐱' },
  { word: 'DOG', image: '🐶' },
];

// Square objects
export interface SquareObject {
  id: string;
  name: string;
  emoji: string;
  isSquare: boolean;
}

export const SQUARE_OBJECTS: SquareObject[] = [
  { id: 'box', name: 'Box', emoji: '📦', isSquare: true },
  { id: 'window', name: 'Window', emoji: '🪟', isSquare: true },
  { id: 'tile', name: 'Tile', emoji: '🔲', isSquare: true },
  { id: 'ball', name: 'Ball', emoji: '⚽', isSquare: false },
];
