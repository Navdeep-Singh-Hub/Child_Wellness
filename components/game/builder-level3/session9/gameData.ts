// Game data for The Builder - Level 3 Session 9

export interface ReadingWord {
  word: string;
  letters: string[];
  emoji: string;
  image: string;
}

export const READING_WORDS: ReadingWord[] = [
  { word: 'CAT', letters: ['C', 'A', 'T'], emoji: '🐱', image: 'cat' },
  { word: 'DOG', letters: ['D', 'O', 'G'], emoji: '🐶', image: 'dog' },
  { word: 'BAT', letters: ['B', 'A', 'T'], emoji: '🦇', image: 'bat' },
];

export interface PictureOption {
  id: string;
  word: string;
  emoji: string;
  isCorrect: boolean;
}

export const SYMMETRY_PUZZLES = [
  { id: 'butterfly', name: 'Butterfly', emoji: '🦋', halfEmoji: '🦋' },
  { id: 'heart', name: 'Heart', emoji: '❤️', halfEmoji: '❤️' },
  { id: 'star', name: 'Star', emoji: '⭐', halfEmoji: '⭐' },
];
