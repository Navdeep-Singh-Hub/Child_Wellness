// Game data for The Builder - Level 3 Session 3

export const WORD_DOG = {
  letters: ['D', 'O', 'G'],
  word: 'DOG',
  image: '🐶',
  pronunciation: 'dog',
};

// Word options for choosing game
export const WORD_OPTIONS_SESSION3 = [
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
