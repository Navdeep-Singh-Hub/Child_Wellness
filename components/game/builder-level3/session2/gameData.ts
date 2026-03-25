// Game data for The Builder - Level 3 Session 2

export const WORD_BAT = {
  letters: ['B', 'A', 'T'],
  word: 'BAT',
  image: '🦇',
  pronunciation: 'bat',
};

// Word options for choosing game
export const WORD_OPTIONS_SESSION2 = [
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
