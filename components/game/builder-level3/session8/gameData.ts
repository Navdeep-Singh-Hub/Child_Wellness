// Game data for The Builder - Level 3 Session 8

export interface CVCWord {
  word: string;
  letters: string[];
  emoji: string;
  image: string;
}

export const CVC_WORDS: CVCWord[] = [
  { word: 'CAT', letters: ['C', 'A', 'T'], emoji: '🐱', image: 'cat' },
  { word: 'BAT', letters: ['B', 'A', 'T'], emoji: '🦇', image: 'bat' },
  { word: 'DOG', letters: ['D', 'O', 'G'], emoji: '🐶', image: 'dog' },
  { word: 'SUN', letters: ['S', 'U', 'N'], emoji: '☀️', image: 'sun' },
];

export interface ShapeObject {
  id: string;
  name: string;
  emoji: string;
  shape: 'circle' | 'triangle' | 'square';
}

export const SHAPE_OBJECTS: ShapeObject[] = [
  { id: 'ball', name: 'Ball', emoji: '⚽', shape: 'circle' },
  { id: 'wheel', name: 'Wheel', emoji: '🛞', shape: 'circle' },
  { id: 'pizza', name: 'Pizza Slice', emoji: '🍕', shape: 'triangle' },
  { id: 'roof', name: 'Roof', emoji: '🏠', shape: 'triangle' },
  { id: 'window', name: 'Window', emoji: '🪟', shape: 'square' },
  { id: 'box', name: 'Box', emoji: '📦', shape: 'square' },
];

export const SHAPE_CATEGORIES = [
  { id: 'circle', name: 'Circle', emoji: '⭕', color: '#6C9EFF' },
  { id: 'triangle', name: 'Triangle', emoji: '🔺', color: '#FFB6C1' },
  { id: 'square', name: 'Square', emoji: '⬜', color: '#7FE7CC' },
];
