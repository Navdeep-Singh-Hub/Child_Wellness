// Game data for The Counter - Level 5 Session 10 (Final Challenge)

export const SIGHT_WORDS_SESSION10 = [
  { word: 'THE', emoji: '📖' },
  { word: 'IS', emoji: '✨' },
  { word: 'GO', emoji: '🏠' },
  { word: 'WE', emoji: '👥' },
];

export const SENTENCE_MATCH_DATA = [
  {
    sentence: 'We go home',
    highlightedWord: 'GO',
    options: ['GO', 'IS', 'THE'],
    correctAnswer: 'GO',
  },
  {
    sentence: 'The dog is big',
    highlightedWord: 'THE',
    options: ['THE', 'IS', 'GO'],
    correctAnswer: 'THE',
  },
  {
    sentence: 'We go to school',
    highlightedWord: 'GO',
    options: ['GO', 'WE', 'IS'],
    correctAnswer: 'GO',
  },
];

export const ADDITION_QUESTIONS = [
  {
    question: '3 + 3 = ?',
    answer: 6,
    objects: ['🍎', '🍎', '🍎', '🍎', '🍎', '🍎'],
    options: [5, 6, 7],
  },
  {
    question: '4 + 2 = ?',
    answer: 6,
    objects: ['⭐', '⭐', '⭐', '⭐', '⭐', '⭐'],
    options: [5, 6, 7],
  },
];

export const MIXED_PUZZLE_DATA = {
  wordTask: {
    word: 'GO',
    sentences: [
      { text: 'We go home', correct: true },
      { text: 'The dog is', correct: false },
      { text: 'We see a cat', correct: false },
    ],
  },
  numberTask: {
    objects: ['⭐', '⭐', '⭐', '⭐', '⭐', '⭐'],
    correctNumber: 6,
    options: [4, 5, 6, 7],
  },
};
