// Game data for The Builder - Level 3 Session 3

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
    description: 'Learn the word DOG',
    emoji: '🔤',
    color: '#6C9EFF',
    duration: '2-3 mins',
  },
  {
    id: 'choose-word',
    title: 'Choose the Word',
    description: 'Identify the word DOG',
    emoji: '👆',
    color: '#FFB6C1',
    duration: '2-3 mins',
  },
  {
    id: 'build-word',
    title: 'Build the Word',
    description: 'Arrange letters to spell DOG',
    emoji: '🧩',
    color: '#7FE7CC',
    duration: '3-4 mins',
  },
  {
    id: 'shape-match',
    title: 'Shape Match',
    description: 'Match triangle objects',
    emoji: '🔺',
    color: '#6C9EFF',
    duration: '2-3 mins',
  },
];

// Word data
export const WORD_DOG = {
  letters: ['D', 'O', 'G'],
  word: 'DOG',
  image: '🐶',
  pronunciation: 'dog',
};

// Word options for choosing game
export const WORD_OPTIONS = [
  { word: 'DOG', image: '🐶' },
  { word: 'CAT', image: '🐱' },
  { word: 'BAT', image: '🦇' },
];

// Triangle objects
export interface TriangleObject {
  id: string;
  name: string;
  emoji: string;
  isTriangle: boolean;
}

export const TRIANGLE_OBJECTS: TriangleObject[] = [
  { id: 'pizza', name: 'Pizza Slice', emoji: '🍕', isTriangle: true },
  { id: 'mountain', name: 'Mountain', emoji: '⛰️', isTriangle: true },
  { id: 'roof', name: 'Roof', emoji: '🏠', isTriangle: true },
  { id: 'ball', name: 'Ball', emoji: '⚽', isTriangle: false },
];
