// Game data for The Builder - Level 3 Session 6

export const WORD_PEN = {
  letters: ['P', 'E', 'N'],
  word: 'PEN',
  image: '✏️',
  pronunciation: 'pen',
};

// Word options for choosing game
export const WORD_OPTIONS_SESSION6 = [
  { word: 'PEN', image: '✏️' },
  { word: 'SUN', image: '☀️' },
  { word: 'DOG', image: '🐶' },
];

// Symmetry shapes
export interface SymmetryShape {
  id: string;
  name: string;
  emoji: string;
  isCorrect: boolean;
}

export const SYMMETRY_SHAPES: SymmetryShape[] = [
  { id: 'butterfly-wing', name: 'Butterfly Wing', emoji: '🦋', isCorrect: true },
  { id: 'heart-half', name: 'Heart Half', emoji: '❤️', isCorrect: true },
  { id: 'star-points', name: 'Star Points', emoji: '⭐', isCorrect: true },
  { id: 'circle', name: 'Circle', emoji: '⭕', isCorrect: false },
];
