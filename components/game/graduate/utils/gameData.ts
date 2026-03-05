// Game data for The Graduate - Level 1 Session 10

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
    id: 'arrange-story',
    name: 'Arrange the Story',
    description: 'Put picture cards in the correct story sequence',
    skillFocus: ['Story Structure', 'Logical Sequencing', 'Beginning–Middle–End'],
    ageRange: '5-7 years',
    difficulty: 'easy',
    duration: '3-4 min',
  },
  {
    id: 'complete-dialogue',
    name: 'Complete the Dialogue',
    description: 'Fill in the missing word in a conversation',
    skillFocus: ['Dialogue Understanding', 'Context Awareness', 'Language Comprehension'],
    ageRange: '5-7 years',
    difficulty: 'easy',
    duration: '3-4 min',
  },
  {
    id: 'word-problem-addition',
    name: 'Word Problem (Addition)',
    description: 'Solve simple addition word problems',
    skillFocus: ['Word Problem Understanding', 'Addition Logic', 'Visual Reasoning'],
    ageRange: '5-7 years',
    difficulty: 'easy',
    duration: '3-4 min',
  },
  {
    id: 'word-problem-subtraction',
    name: 'Word Problem (Subtraction)',
    description: 'Solve simple subtraction word problems',
    skillFocus: ['Subtraction Logic', 'Cause & Effect', 'One-to-One Removal'],
    ageRange: '5-7 years',
    difficulty: 'easy',
    duration: '3-4 min',
  },
  {
    id: 'graduate-challenge',
    name: 'Graduate Challenge Mix',
    description: 'Switch between story, dialogue, and word problems',
    skillFocus: ['Integrated Thinking', 'Reading + Logic', 'Cognitive Flexibility'],
    ageRange: '5-7 years',
    difficulty: 'easy',
    duration: '3-4 min',
  },
];

// Story sequencing data
export interface StorySequence {
  id: string;
  title: string;
  parts: Array<{ id: number; text: string; emoji: string }>;
  correctOrder: number[];
}

export const STORY_SEQUENCES: StorySequence[] = [
  {
    id: '1',
    title: 'The Ball Story',
    parts: [
      { id: 1, text: 'Boy gets ball', emoji: '👦⚽' },
      { id: 2, text: 'Boy plays', emoji: '👦🏃' },
      { id: 3, text: 'Ball goes home', emoji: '⚽🏠' },
    ],
    correctOrder: [1, 2, 3],
  },
  {
    id: '2',
    title: 'The Plant Story',
    parts: [
      { id: 1, text: 'Plant seed', emoji: '🌱' },
      { id: 2, text: 'Water plant', emoji: '💧🌱' },
      { id: 3, text: 'Flower grows', emoji: '🌸' },
    ],
    correctOrder: [1, 2, 3],
  },
  {
    id: '3',
    title: 'The Cake Story',
    parts: [
      { id: 1, text: 'Mix ingredients', emoji: '🥣' },
      { id: 2, text: 'Bake cake', emoji: '🍰' },
      { id: 3, text: 'Eat cake', emoji: '😋🍰' },
    ],
    correctOrder: [1, 2, 3],
  },
  {
    id: '4',
    title: 'The Bird Story',
    parts: [
      { id: 1, text: 'Bird in nest', emoji: '🐦🏠' },
      { id: 2, text: 'Bird flies', emoji: '🐦✈️' },
      { id: 3, text: 'Bird finds food', emoji: '🐦🍎' },
    ],
    correctOrder: [1, 2, 3],
  },
];

// Dialogue completion data
export interface DialogueQuestion {
  id: string;
  dialogue: string;
  question: string;
  correctAnswer: string;
  options: string[];
}

export const DIALOGUE_QUESTIONS: DialogueQuestion[] = [
  {
    id: '1',
    dialogue: 'Mom: "Where is your bag?"\nChild: "It is ____ the table."',
    question: 'Complete the dialogue',
    correctAnswer: 'under',
    options: ['on', 'under', 'in'],
  },
  {
    id: '2',
    dialogue: 'Teacher: "What color is the sky?"\nChild: "The sky is ____."',
    question: 'Complete the dialogue',
    correctAnswer: 'blue',
    options: ['blue', 'red', 'green'],
  },
  {
    id: '3',
    dialogue: 'Dad: "Where are you going?"\nChild: "I am going ____ the park."',
    question: 'Complete the dialogue',
    correctAnswer: 'to',
    options: ['to', 'in', 'on'],
  },
  {
    id: '4',
    dialogue: 'Friend: "What do you like?"\nChild: "I like ____."',
    question: 'Complete the dialogue',
    correctAnswer: 'apples',
    options: ['apples', 'cars', 'books'],
  },
  {
    id: '5',
    dialogue: 'Mom: "Where is the cat?"\nChild: "The cat is ____ the mat."',
    question: 'Complete the dialogue',
    correctAnswer: 'on',
    options: ['on', 'under', 'in'],
  },
];

// Word problem data (Addition)
export interface AdditionWordProblem {
  id: string;
  problem: string;
  start: number;
  add: number;
  answer: number;
  objectType: 'apple' | 'ball' | 'bird' | 'book' | 'star';
}

export const ADDITION_WORD_PROBLEMS: AdditionWordProblem[] = [
  { id: '1', problem: 'Riya has 2 apples. She gets 1 more apple. How many apples does she have?', start: 2, add: 1, answer: 3, objectType: 'apple' },
  { id: '2', problem: 'Tom has 3 balls. He gets 2 more balls. How many balls does he have?', start: 3, add: 2, answer: 5, objectType: 'ball' },
  { id: '3', problem: 'Sara has 1 book. She gets 3 more books. How many books does she have?', start: 1, add: 3, answer: 4, objectType: 'book' },
  { id: '4', problem: 'Ali has 4 stars. He gets 2 more stars. How many stars does he have?', start: 4, add: 2, answer: 6, objectType: 'star' },
  { id: '5', problem: 'Maya has 2 birds. She gets 3 more birds. How many birds does she have?', start: 2, add: 3, answer: 5, objectType: 'bird' },
];

// Word problem data (Subtraction)
export interface SubtractionWordProblem {
  id: string;
  problem: string;
  start: number;
  remove: number;
  answer: number;
  objectType: 'bird' | 'apple' | 'ball' | 'star' | 'book';
}

export const SUBTRACTION_WORD_PROBLEMS: SubtractionWordProblem[] = [
  { id: '1', problem: 'There are 5 birds on a tree. 2 birds fly away. How many are left?', start: 5, remove: 2, answer: 3, objectType: 'bird' },
  { id: '2', problem: 'Riya has 4 apples. She eats 1 apple. How many apples are left?', start: 4, remove: 1, answer: 3, objectType: 'apple' },
  { id: '3', problem: 'Tom has 6 balls. He gives away 2 balls. How many balls are left?', start: 6, remove: 2, answer: 4, objectType: 'ball' },
  { id: '4', problem: 'There are 7 stars in the sky. 3 stars disappear. How many are left?', start: 7, remove: 3, answer: 4, objectType: 'star' },
  { id: '5', problem: 'Sara has 5 books. She reads 2 books. How many books are left?', start: 5, remove: 2, answer: 3, objectType: 'book' },
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

// Helper function to get wrong answer options for word problems
export function getWordProblemOptions(correct: number, max: number = 10): number[] {
  const allOptions = Array.from({ length: max }, (_, i) => i + 1);
  const wrongOptions = allOptions.filter((n) => n !== correct);
  return shuffleArray([correct, ...shuffleArray(wrongOptions).slice(0, 2)]);
}
