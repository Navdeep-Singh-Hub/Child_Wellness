// Game data for The Builder - Level 3 Session 7

export const WORD_CUP = {
  letters: ['C', 'U', 'P'],
  word: 'CUP',
  image: '☕',
  pronunciation: 'cup',
};

// Word options for choosing game
export const WORD_OPTIONS_SESSION7 = [
  { word: 'CUP', image: '☕' },
  { word: 'PEN', image: '✏️' },
  { word: 'SUN', image: '☀️' },
];

// Mirror drawing shapes
export interface MirrorShape {
  id: string;
  name: string;
  emoji: string;
  halfEmoji: string;
}

export const MIRROR_SHAPES: MirrorShape[] = [
  { id: 'heart', name: 'Heart', emoji: '❤️', halfEmoji: '❤️' },
  { id: 'butterfly', name: 'Butterfly', emoji: '🦋', halfEmoji: '🦋' },
  { id: 'star', name: 'Star', emoji: '⭐', halfEmoji: '⭐' },
];
