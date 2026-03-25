// Game data for The Builder - Level 3 Session 4

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
    description: 'Learn the word HAT',
    emoji: '🔤',
    color: '#6C9EFF',
    duration: '2-3 mins',
  },
  {
    id: 'choose-word',
    title: 'Choose the Word',
    description: 'Identify the word HAT',
    emoji: '👆',
    color: '#FFB6C1',
    duration: '2-3 mins',
  },
  {
    id: 'build-word',
    title: 'Build the Word',
    description: 'Arrange letters to spell HAT',
    emoji: '🧩',
    color: '#7FE7CC',
    duration: '3-4 mins',
  },
  {
    id: 'shape-match',
    title: 'Shape Match',
    description: 'Match rectangle objects',
    emoji: '▭',
    color: '#6C9EFF',
    duration: '2-3 mins',
  },
];

// Word data
export const WORD_HAT = {
  letters: ['H', 'A', 'T'],
  word: 'HAT',
  image: '🎩',
  pronunciation: 'hat',
};

// Word options for choosing game
export const WORD_OPTIONS = [
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
