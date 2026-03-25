// Game data for The Builder - Level 3 Session 5

export const WORD_SUN = {
  letters: ['S', 'U', 'N'],
  word: 'SUN',
  image: '☀️',
  pronunciation: 'sun',
};

// Word options for choosing game
export const WORD_OPTIONS_SESSION5 = [
  { word: 'SUN', image: '☀️' },
  { word: 'RUN', image: '🏃' },
  { word: 'HAT', image: '🎩' },
];

// Oval objects
export interface OvalObject {
  id: string;
  name: string;
  emoji: string;
  isOval: boolean;
}

export const OVAL_OBJECTS: OvalObject[] = [
  { id: 'egg', name: 'Egg', emoji: '🥚', isOval: true },
  { id: 'balloon', name: 'Balloon', emoji: '🎈', isOval: true },
  { id: 'ball', name: 'Ball', emoji: '⚽', isOval: false },
  { id: 'book', name: 'Book', emoji: '📖', isOval: false },
];
