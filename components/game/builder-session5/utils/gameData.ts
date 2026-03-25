// Game data for The Builder - Level 3 Session 5

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
    description: 'Learn the word SUN',
    emoji: '🔤',
    color: '#6C9EFF',
    duration: '2-3 mins',
  },
  {
    id: 'choose-word',
    title: 'Choose the Word',
    description: 'Identify the word SUN',
    emoji: '👆',
    color: '#FFB6C1',
    duration: '2-3 mins',
  },
  {
    id: 'build-word',
    title: 'Build the Word',
    description: 'Arrange letters to spell SUN',
    emoji: '🧩',
    color: '#7FE7CC',
    duration: '3-4 mins',
  },
  {
    id: 'shape-match',
    title: 'Shape Match',
    description: 'Match oval objects',
    emoji: '⬭',
    color: '#6C9EFF',
    duration: '2-3 mins',
  },
];

// Word data
export const WORD_SUN = {
  letters: ['S', 'U', 'N'],
  word: 'SUN',
  image: '☀️',
  pronunciation: 'sun',
};

// Word options for choosing game
export const WORD_OPTIONS = [
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
