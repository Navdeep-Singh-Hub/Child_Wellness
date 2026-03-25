// Game data for The Builder - Level 3 Session 10 (Final Challenge)

export interface ChallengeWord {
  word: string;
  letters: string[];
  emoji: string;
  image: string;
}

export const CHALLENGE_WORDS: ChallengeWord[] = [
  { word: 'CAT', letters: ['C', 'A', 'T'], emoji: '🐱', image: 'cat' },
  { word: 'DOG', letters: ['D', 'O', 'G'], emoji: '🐶', image: 'dog' },
  { word: 'SUN', letters: ['S', 'U', 'N'], emoji: '☀️', image: 'sun' },
  { word: 'BAT', letters: ['B', 'A', 'T'], emoji: '🦇', image: 'bat' },
];

export interface Shape {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export const SHAPES: Shape[] = [
  { id: 'circle', name: 'Circle', emoji: '⭕', color: '#6C9EFF' },
  { id: 'square', name: 'Square', emoji: '⬜', color: '#FFB6C1' },
  { id: 'triangle', name: 'Triangle', emoji: '🔺', color: '#7FE7CC' },
];

export interface ShapeObject {
  id: string;
  name: string;
  emoji: string;
  shape: 'circle' | 'square' | 'triangle';
}

export const SHAPE_OBJECTS: ShapeObject[] = [
  { id: 'ball', name: 'Ball', emoji: '⚽', shape: 'circle' },
  { id: 'wheel', name: 'Wheel', emoji: '🛞', shape: 'circle' },
  { id: 'pizza', name: 'Pizza Slice', emoji: '🍕', shape: 'triangle' },
  { id: 'roof', name: 'Roof', emoji: '🏠', shape: 'triangle' },
  { id: 'window', name: 'Window', emoji: '🪟', shape: 'square' },
  { id: 'box', name: 'Box', emoji: '📦', shape: 'square' },
];
