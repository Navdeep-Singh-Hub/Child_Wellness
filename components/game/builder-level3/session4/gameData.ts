// Game data for The Builder - Level 3 Session 4

export const WORD_HAT = {
  letters: ['H', 'A', 'T'],
  word: 'HAT',
  image: '🎩',
  pronunciation: 'hat',
};

// Word options for choosing game
export const WORD_OPTIONS_SESSION4 = [
  { word: 'HAT', image: '🎩' },
  { word: 'CAT', image: '🐱' },
  { word: 'BAT', image: '🦇' },
];

// Rectangle objects
export interface RectangleObject {
  id: string;
  name: string;
  emoji: string;
  isRectangle: boolean;
}

export const RECTANGLE_OBJECTS: RectangleObject[] = [
  { id: 'door', name: 'Door', emoji: '🚪', isRectangle: true },
  { id: 'book', name: 'Book', emoji: '📖', isRectangle: true },
  { id: 'phone', name: 'Phone', emoji: '📱', isRectangle: true },
  { id: 'ball', name: 'Ball', emoji: '⚽', isRectangle: false },
];
