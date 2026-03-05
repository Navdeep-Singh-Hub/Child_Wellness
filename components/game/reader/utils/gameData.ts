// Game data for The Reader - Level 1 Session 7

export type Difficulty = 'easy' | 'medium' | 'hard';

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
    id: 'build-sentence',
    name: 'Build the Sentence',
    description: 'Complete the sentence by choosing the correct word',
    skillFocus: ['Sentence Completion', 'Sight Word Reinforcement', 'Picture-Word Linking'],
    ageRange: '4-6 years',
    difficulty: 'easy',
    duration: '2-4 min',
  },
  {
    id: 'arrange-sentence',
    name: 'Arrange the Sentence',
    description: 'Put words in the correct order to make a sentence',
    skillFocus: ['Sentence Structure', 'Word Order Awareness', 'Logical Sequencing'],
    ageRange: '4-6 years',
    difficulty: 'easy',
    duration: '2-4 min',
  },
  {
    id: 'take-away',
    name: 'Take Away',
    description: 'Remove objects and find how many are left',
    skillFocus: ['Subtraction Concept', 'Concrete Removal', 'Counting Accuracy'],
    ageRange: '4-6 years',
    difficulty: 'easy',
    duration: '2-4 min',
  },
  {
    id: 'subtraction-builder',
    name: 'Subtraction Builder',
    description: 'Tap objects to remove them and solve subtraction',
    skillFocus: ['One-to-One Removal', 'Visual Math', 'Logical Thinking'],
    ageRange: '4-6 years',
    difficulty: 'easy',
    duration: '2-4 min',
  },
  {
    id: 'reading-subtraction-mix',
    name: 'Reading + Subtraction Mix',
    description: 'Switch between reading and subtraction challenges',
    skillFocus: ['Cognitive Switching', 'Reading + Math Integration', 'Focus'],
    ageRange: '4-6 years',
    difficulty: 'easy',
    duration: '2-4 min',
  },
];

// Sentence building data
export interface SentenceItem {
  id: string;
  picture: string;
  sentence: string;
  missingWord: string;
  options: string[];
}

export const SENTENCE_BUILD_DATA: SentenceItem[] = [
  { id: '1', picture: 'cat', sentence: 'I see a cat.', missingWord: 'cat', options: ['cat', 'dog', 'sun'] },
  { id: '2', picture: 'dog', sentence: 'I see a dog.', missingWord: 'dog', options: ['dog', 'cat', 'sun'] },
  { id: '3', picture: 'sun', sentence: 'I see a sun.', missingWord: 'sun', options: ['sun', 'cat', 'dog'] },
  { id: '4', picture: 'ball', sentence: 'I see a ball.', missingWord: 'ball', options: ['ball', 'cat', 'dog'] },
  { id: '5', picture: 'car', sentence: 'I see a car.', missingWord: 'car', options: ['car', 'cat', 'sun'] },
  { id: '6', picture: 'tree', sentence: 'I see a tree.', missingWord: 'tree', options: ['tree', 'cat', 'dog'] },
];

// Sentence arrangement data
export interface SentenceArrangement {
  id: string;
  sentence: string;
  words: string[];
}

export const SENTENCE_ARRANGE_DATA: SentenceArrangement[] = [
  { id: '1', sentence: 'I see cat', words: ['I', 'see', 'cat'] },
  { id: '2', sentence: 'I see dog', words: ['I', 'see', 'dog'] },
  { id: '3', sentence: 'I see sun', words: ['I', 'see', 'sun'] },
  { id: '4', sentence: 'I see ball', words: ['I', 'see', 'ball'] },
  { id: '5', sentence: 'I see car', words: ['I', 'see', 'car'] },
  { id: '6', sentence: 'I see tree', words: ['I', 'see', 'tree'] },
];

// Subtraction data
export interface SubtractionItem {
  id: string;
  total: number;
  remove: number;
  answer: number;
  objectType: 'apple' | 'ball' | 'star' | 'heart' | 'circle';
}

export const SUBTRACTION_DATA: SubtractionItem[] = [
  { id: '1', total: 4, remove: 1, answer: 3, objectType: 'apple' },
  { id: '2', total: 5, remove: 2, answer: 3, objectType: 'ball' },
  { id: '3', total: 3, remove: 1, answer: 2, objectType: 'star' },
  { id: '4', total: 5, remove: 1, answer: 4, objectType: 'heart' },
  { id: '5', total: 4, remove: 2, answer: 2, objectType: 'circle' },
  { id: '6', total: 5, remove: 3, answer: 2, objectType: 'apple' },
  { id: '7', total: 3, remove: 2, answer: 1, objectType: 'ball' },
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

// Helper function to get wrong options for subtraction
export function getSubtractionOptions(correct: number): number[] {
  const allOptions = [1, 2, 3, 4, 5];
  const wrongOptions = allOptions.filter((n) => n !== correct);
  return shuffleArray([correct, ...shuffleArray(wrongOptions).slice(0, 2)]);
}
