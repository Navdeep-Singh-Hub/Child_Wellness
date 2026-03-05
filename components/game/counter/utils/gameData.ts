// Game data for The Counter - Level 1 Session 5

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
    id: 'tap-sight-word',
    name: 'Tap the Sight Word',
    description: 'Listen and tap the correct sight word',
    skillFocus: ['Sight Word Recognition', 'Visual Memory', 'Attention'],
    ageRange: '4-6 years',
    difficulty: 'easy',
    duration: '2-4 min',
  },
  {
    id: 'find-word-sentence',
    name: 'Find the Word in a Sentence',
    description: 'Tap the word you hear in the sentence',
    skillFocus: ['Word Identification', 'Reading Tracking', 'Attention to Detail'],
    ageRange: '4-6 years',
    difficulty: 'easy',
    duration: '2-4 min',
  },
  {
    id: 'count-add-objects',
    name: 'Count & Add',
    description: 'Count objects and find the total',
    skillFocus: ['One-to-One Counting', 'Visual Addition', 'Number Recognition'],
    ageRange: '4-6 years',
    difficulty: 'easy',
    duration: '2-4 min',
  },
  {
    id: 'build-addition',
    name: 'Build the Addition',
    description: 'Drag and count to solve addition problems',
    skillFocus: ['Addition Concept', 'Concrete Manipulation', 'Counting Accuracy'],
    ageRange: '4-6 years',
    difficulty: 'easy',
    duration: '2-4 min',
  },
  {
    id: 'reading-counting-mix',
    name: 'Reading + Counting Mix',
    description: 'Switch between reading and counting challenges',
    skillFocus: ['Cognitive Switching', 'Reading + Math Integration', 'Focus'],
    ageRange: '4-6 years',
    difficulty: 'easy',
    duration: '2-4 min',
  },
];

// Sight words for Level 1
export const SIGHT_WORDS = ['the', 'and', 'is', 'in', 'to', 'it', 'on'];

// Sight word game data
export interface SightWordItem {
  word: string;
  options: string[];
}

export const SIGHT_WORD_DATA: SightWordItem[] = [
  { word: 'the', options: ['the', 'and', 'is'] },
  { word: 'and', options: ['and', 'the', 'is'] },
  { word: 'is', options: ['is', 'the', 'and'] },
  { word: 'in', options: ['in', 'to', 'it'] },
  { word: 'to', options: ['to', 'in', 'it'] },
  { word: 'it', options: ['it', 'in', 'to'] },
  { word: 'on', options: ['on', 'the', 'is'] },
];

// Sentence data
export interface SentenceItem {
  sentence: string;
  targetWord: string;
  words: string[];
}

export const SENTENCE_DATA: SentenceItem[] = [
  { sentence: 'The cat is on the mat.', targetWord: 'the', words: ['The', 'cat', 'is', 'on', 'the', 'mat.'] },
  { sentence: 'The cat is on the mat.', targetWord: 'is', words: ['The', 'cat', 'is', 'on', 'the', 'mat.'] },
  { sentence: 'The cat is on the mat.', targetWord: 'on', words: ['The', 'cat', 'is', 'on', 'the', 'mat.'] },
  { sentence: 'I see it in the box.', targetWord: 'it', words: ['I', 'see', 'it', 'in', 'the', 'box.'] },
  { sentence: 'I see it in the box.', targetWord: 'in', words: ['I', 'see', 'it', 'in', 'the', 'box.'] },
  { sentence: 'The dog and cat play.', targetWord: 'and', words: ['The', 'dog', 'and', 'cat', 'play.'] },
];

// Counting and addition data
export interface CountingItem {
  group1: number;
  group2: number;
  total: number;
  objectType: 'apple' | 'ball' | 'star' | 'heart' | 'circle';
}

export const COUNTING_DATA: CountingItem[] = [
  { group1: 1, group2: 1, total: 2, objectType: 'apple' },
  { group1: 2, group2: 1, total: 3, objectType: 'apple' },
  { group1: 1, group2: 2, total: 3, objectType: 'ball' },
  { group1: 2, group2: 2, total: 4, objectType: 'star' },
  { group1: 1, group2: 3, total: 4, objectType: 'heart' },
  { group1: 2, group2: 3, total: 5, objectType: 'circle' },
  { group1: 1, group2: 4, total: 5, objectType: 'apple' },
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

// Helper function to get wrong options for counting
export function getCountingOptions(correct: number): number[] {
  const allOptions = [1, 2, 3, 4, 5];
  const wrongOptions = allOptions.filter((n) => n !== correct);
  return shuffleArray([correct, ...shuffleArray(wrongOptions).slice(0, 2)]);
}
