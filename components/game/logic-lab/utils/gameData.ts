// Game data for The Logic Lab - Level 1 Session 6

export type Difficulty = 'easy' | 'medium' | 'hard';
export type Preposition = 'in' | 'on' | 'under';

export interface GameCard {
  id: string;
  name: string;
  description: string;
  skillFocus: string[];
  ageRange: string;
  difficulty: Difficulty;
  duration: string;
}

export const GAMES: GameCard[] = [
  {
    id: 'place-it-right',
    name: 'Place It Right',
    description: 'Drag objects to the correct position',
    skillFocus: ['Spatial Awareness', 'Listening Skills', 'Language Comprehension'],
    ageRange: '4-6 years',
    difficulty: 'easy',
    duration: '2-4 min',
  },
  {
    id: 'choose-correct-picture',
    name: 'Choose the Correct Picture',
    description: 'Tap the picture that matches the instruction',
    skillFocus: ['Visual Discrimination', 'Preposition Understanding', 'Attention'],
    ageRange: '4-6 years',
    difficulty: 'easy',
    duration: '2-4 min',
  },
  {
    id: 'complete-pattern',
    name: 'Complete the Pattern',
    description: 'Find the shape that completes the pattern',
    skillFocus: ['Pattern Recognition', 'Logical Thinking', 'Visual Sequencing'],
    ageRange: '4-6 years',
    difficulty: 'easy',
    duration: '2-4 min',
  },
  {
    id: 'arrange-sequence',
    name: 'Arrange the Sequence',
    description: 'Put the pictures in the correct order',
    skillFocus: ['Sequencing', 'Logical Order', 'Cause & Effect Understanding'],
    ageRange: '4-6 years',
    difficulty: 'easy',
    duration: '2-4 min',
  },
  {
    id: 'logic-mix-challenge',
    name: 'Logic Mix Mini Challenge',
    description: 'Switch between different logic challenges',
    skillFocus: ['Cognitive Flexibility', 'Attention Switching', 'Logical Integration'],
    ageRange: '4-6 years',
    difficulty: 'easy',
    duration: '2-4 min',
  },
];

// Preposition placement data
export interface PrepositionPlacement {
  id: string;
  object: string;
  preposition: Preposition;
  target: string;
  objectEmoji: string;
  targetEmoji: string;
}

export const PLACEMENT_DATA: PrepositionPlacement[] = [
  { id: '1', object: 'ball', preposition: 'on', target: 'table', objectEmoji: '⚽', targetEmoji: '🪑' },
  { id: '2', object: 'ball', preposition: 'under', target: 'table', objectEmoji: '⚽', targetEmoji: '🪑' },
  { id: '3', object: 'ball', preposition: 'in', target: 'box', objectEmoji: '⚽', targetEmoji: '📦' },
  { id: '4', object: 'apple', preposition: 'on', target: 'table', objectEmoji: '🍎', targetEmoji: '🪑' },
  { id: '5', object: 'apple', preposition: 'in', target: 'box', objectEmoji: '🍎', targetEmoji: '📦' },
  { id: '6', object: 'book', preposition: 'under', target: 'table', objectEmoji: '📚', targetEmoji: '🪑' },
];

// Picture choice data
export interface PictureChoice {
  id: string;
  instruction: string;
  preposition: Preposition;
  options: Array<{
    id: string;
    description: string;
    emoji: string;
    correct: boolean;
  }>;
}

export const PICTURE_CHOICE_DATA: PictureChoice[] = [
  {
    id: '1',
    instruction: 'Tap the picture where the ball is UNDER the table',
    preposition: 'under',
    options: [
      { id: 'a', description: 'Ball under table', emoji: '⚽⬇️🪑', correct: true },
      { id: 'b', description: 'Ball on table', emoji: '⚽⬆️🪑', correct: false },
      { id: 'c', description: 'Ball in box', emoji: '⚽📦', correct: false },
    ],
  },
  {
    id: '2',
    instruction: 'Tap the picture where the ball is ON the table',
    preposition: 'on',
    options: [
      { id: 'a', description: 'Ball under table', emoji: '⚽⬇️🪑', correct: false },
      { id: 'b', description: 'Ball on table', emoji: '⚽⬆️🪑', correct: true },
      { id: 'c', description: 'Ball in box', emoji: '⚽📦', correct: false },
    ],
  },
  {
    id: '3',
    instruction: 'Tap the picture where the apple is IN the box',
    preposition: 'in',
    options: [
      { id: 'a', description: 'Apple on table', emoji: '🍎⬆️🪑', correct: false },
      { id: 'b', description: 'Apple in box', emoji: '🍎📦', correct: true },
      { id: 'c', description: 'Apple under table', emoji: '🍎⬇️🪑', correct: false },
    ],
  },
  {
    id: '4',
    instruction: 'Tap the picture where the book is UNDER the table',
    preposition: 'under',
    options: [
      { id: 'a', description: 'Book on table', emoji: '📚⬆️🪑', correct: false },
      { id: 'b', description: 'Book in box', emoji: '📚📦', correct: false },
      { id: 'c', description: 'Book under table', emoji: '📚⬇️🪑', correct: true },
    ],
  },
  {
    id: '5',
    instruction: 'Tap the picture where the ball is ON the table',
    preposition: 'on',
    options: [
      { id: 'a', description: 'Ball in box', emoji: '⚽📦', correct: false },
      { id: 'b', description: 'Ball on table', emoji: '⚽⬆️🪑', correct: true },
      { id: 'c', description: 'Ball under table', emoji: '⚽⬇️🪑', correct: false },
    ],
  },
];

// Pattern data
export type PatternType = 'ABAB' | 'AABB' | 'ABC';
export type PatternItem = '🔵' | '🔴' | '🟢' | '🟡' | '🟣';

export interface Pattern {
  id: string;
  type: PatternType;
  sequence: PatternItem[];
  correctAnswer: PatternItem;
  options: PatternItem[];
}

export const PATTERN_DATA: Pattern[] = [
  {
    id: '1',
    type: 'ABAB',
    sequence: ['🔵', '🔴', '🔵', '🔴'],
    correctAnswer: '🔵',
    options: ['🔵', '🔴', '🟢'],
  },
  {
    id: '2',
    type: 'ABAB',
    sequence: ['🔴', '🔵', '🔴', '🔵'],
    correctAnswer: '🔴',
    options: ['🔵', '🔴', '🟢'],
  },
  {
    id: '3',
    type: 'AABB',
    sequence: ['🔵', '🔵', '🔴', '🔴'],
    correctAnswer: '🔵',
    options: ['🔵', '🔴', '🟢'],
  },
  {
    id: '4',
    type: 'AABB',
    sequence: ['🔴', '🔴', '🔵', '🔵'],
    correctAnswer: '🔴',
    options: ['🔵', '🔴', '🟢'],
  },
  {
    id: '5',
    type: 'ABC',
    sequence: ['🔵', '🔴', '🟢'],
    correctAnswer: '🔵',
    options: ['🔵', '🔴', '🟢'],
  },
];

// Sequence data
export interface SequenceItem {
  id: string;
  step: number;
  description: string;
  emoji: string;
}

export interface Sequence {
  id: string;
  title: string;
  items: SequenceItem[];
}

export const SEQUENCE_DATA: Sequence[] = [
  {
    id: '1',
    title: 'Plant Growing',
    items: [
      { id: 'a', step: 1, description: 'Plant seed', emoji: '🌱' },
      { id: 'b', step: 2, description: 'Water plant', emoji: '💧' },
      { id: 'c', step: 3, description: 'Flower grows', emoji: '🌸' },
    ],
  },
  {
    id: '2',
    title: 'Building a House',
    items: [
      { id: 'a', step: 1, description: 'Foundation', emoji: '🏗️' },
      { id: 'b', step: 2, description: 'Walls', emoji: '🧱' },
      { id: 'c', step: 3, description: 'Roof', emoji: '🏠' },
    ],
  },
  {
    id: '3',
    title: 'Making a Cake',
    items: [
      { id: 'a', step: 1, description: 'Mix ingredients', emoji: '🥣' },
      { id: 'b', step: 2, description: 'Bake in oven', emoji: '🔥' },
      { id: 'c', step: 3, description: 'Decorate', emoji: '🎂' },
    ],
  },
  {
    id: '4',
    title: 'Butterfly Life',
    items: [
      { id: 'a', step: 1, description: 'Egg', emoji: '🥚' },
      { id: 'b', step: 2, description: 'Caterpillar', emoji: '🐛' },
      { id: 'c', step: 3, description: 'Butterfly', emoji: '🦋' },
    ],
  },
  {
    id: '5',
    title: 'Day to Night',
    items: [
      { id: 'a', step: 1, description: 'Morning', emoji: '🌅' },
      { id: 'b', step: 2, description: 'Afternoon', emoji: '☀️' },
      { id: 'c', step: 3, description: 'Night', emoji: '🌙' },
    ],
  },
];

// Helper function to shuffle array
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
