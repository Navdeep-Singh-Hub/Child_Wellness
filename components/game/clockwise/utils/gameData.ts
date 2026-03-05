// Game data for The Clockwise - Level 1 Session 9

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
    id: 'read-answer',
    name: 'Read & Answer',
    description: 'Read a sentence and answer the question',
    skillFocus: ['Reading Comprehension', 'Understanding Context', 'Logical Thinking'],
    ageRange: '5-7 years',
    difficulty: 'easy',
    duration: '3-4 min',
  },
  {
    id: 'story-question',
    name: 'Story & Question',
    description: 'Listen to a story and answer questions',
    skillFocus: ['Listening Comprehension', 'Detail Recall', 'Attention'],
    ageRange: '5-7 years',
    difficulty: 'easy',
    duration: '3-4 min',
  },
  {
    id: 'read-clock',
    name: 'Read the Clock',
    description: 'Read the time on an analog clock',
    skillFocus: ['Time Recognition', 'Visual Interpretation', 'Number Awareness'],
    ageRange: '5-7 years',
    difficulty: 'easy',
    duration: '3-4 min',
  },
  {
    id: 'which-is-bigger',
    name: 'Which is Bigger?',
    description: 'Compare objects and choose the correct one',
    skillFocus: ['Measurement Concepts', 'Comparison', 'Logical Reasoning'],
    ageRange: '5-7 years',
    difficulty: 'easy',
    duration: '3-4 min',
  },
  {
    id: 'mixed-thinking',
    name: 'Mixed Thinking Challenge',
    description: 'Switch between reading, time, and measurement questions',
    skillFocus: ['Cognitive Flexibility', 'Reading + Math Integration', 'Focus'],
    ageRange: '5-7 years',
    difficulty: 'easy',
    duration: '3-4 min',
  },
];

// Reading comprehension questions
export interface ReadingQuestion {
  id: string;
  sentence: string;
  question: string;
  correctAnswer: string;
  options: string[];
}

export const READING_QUESTIONS: ReadingQuestion[] = [
  {
    id: '1',
    sentence: 'The cat is on the mat.',
    question: 'Where is the cat?',
    correctAnswer: 'On the mat',
    options: ['On the mat', 'In the box', 'Under the table'],
  },
  {
    id: '2',
    sentence: 'The dog is in the garden.',
    question: 'Where is the dog?',
    correctAnswer: 'In the garden',
    options: ['In the garden', 'On the roof', 'Under the bed'],
  },
  {
    id: '3',
    sentence: 'The bird is on the tree.',
    question: 'Where is the bird?',
    correctAnswer: 'On the tree',
    options: ['On the tree', 'In the water', 'Under the car'],
  },
  {
    id: '4',
    sentence: 'The ball is under the table.',
    question: 'Where is the ball?',
    correctAnswer: 'Under the table',
    options: ['Under the table', 'On the chair', 'In the bag'],
  },
  {
    id: '5',
    sentence: 'The book is on the shelf.',
    question: 'Where is the book?',
    correctAnswer: 'On the shelf',
    options: ['On the shelf', 'In the box', 'Under the bed'],
  },
];

// Story questions
export interface StoryQuestion {
  id: string;
  story: string[];
  question: string;
  correctAnswer: string;
  options: string[];
}

export const STORY_QUESTIONS: StoryQuestion[] = [
  {
    id: '1',
    story: ['Riya has a red ball.', 'She plays in the park.'],
    question: 'What color is the ball?',
    correctAnswer: 'Red',
    options: ['Red', 'Blue', 'Green'],
  },
  {
    id: '2',
    story: ['Tom has a big dog.', 'The dog is brown.'],
    question: 'What color is the dog?',
    correctAnswer: 'Brown',
    options: ['Brown', 'White', 'Black'],
  },
  {
    id: '3',
    story: ['Sara has three apples.', 'She gives one to her friend.'],
    question: 'How many apples does Sara have now?',
    correctAnswer: 'Two',
    options: ['Two', 'Three', 'Four'],
  },
  {
    id: '4',
    story: ['The sun is bright.', 'It is in the sky.'],
    question: 'Where is the sun?',
    correctAnswer: 'In the sky',
    options: ['In the sky', 'On the ground', 'In the water'],
  },
  {
    id: '5',
    story: ['The cat is sleeping.', 'It is on the sofa.'],
    question: 'Where is the cat?',
    correctAnswer: 'On the sofa',
    options: ['On the sofa', 'In the garden', 'Under the bed'],
  },
];

// Clock times (hour only, 1-12)
export interface ClockTime {
  id: string;
  hour: number;
  display: string;
}

export const CLOCK_TIMES: ClockTime[] = [
  { id: '1', hour: 1, display: '1 o\'clock' },
  { id: '2', hour: 2, display: '2 o\'clock' },
  { id: '3', hour: 3, display: '3 o\'clock' },
  { id: '4', hour: 4, display: '4 o\'clock' },
  { id: '5', hour: 5, display: '5 o\'clock' },
  { id: '6', hour: 6, display: '6 o\'clock' },
  { id: '7', hour: 7, display: '7 o\'clock' },
  { id: '8', hour: 8, display: '8 o\'clock' },
  { id: '9', hour: 9, display: '9 o\'clock' },
  { id: '10', hour: 10, display: '10 o\'clock' },
  { id: '11', hour: 11, display: '11 o\'clock' },
  { id: '12', hour: 12, display: '12 o\'clock' },
];

// Measurement comparisons
export interface MeasurementComparison {
  id: string;
  type: 'bigger' | 'longer' | 'heavier';
  object1: { name: string; emoji: string; size: 'big' | 'small' | 'long' | 'short' | 'heavy' | 'light' };
  object2: { name: string; emoji: string; size: 'big' | 'small' | 'long' | 'short' | 'heavy' | 'light' };
  correctAnswer: 1 | 2;
  question: string;
}

export const MEASUREMENT_COMPARISONS: MeasurementComparison[] = [
  {
    id: '1',
    type: 'bigger',
    object1: { name: 'Big apple', emoji: '🍎', size: 'big' },
    object2: { name: 'Small apple', emoji: '🍎', size: 'small' },
    correctAnswer: 1,
    question: 'Which is bigger?',
  },
  {
    id: '2',
    type: 'longer',
    object1: { name: 'Long pencil', emoji: '✏️', size: 'long' },
    object2: { name: 'Short pencil', emoji: '✏️', size: 'short' },
    correctAnswer: 1,
    question: 'Which is longer?',
  },
  {
    id: '3',
    type: 'heavier',
    object1: { name: 'Heavy rock', emoji: '🪨', size: 'heavy' },
    object2: { name: 'Light balloon', emoji: '🎈', size: 'light' },
    correctAnswer: 1,
    question: 'Which is heavier?',
  },
  {
    id: '4',
    type: 'bigger',
    object1: { name: 'Small ball', emoji: '⚽', size: 'small' },
    object2: { name: 'Big ball', emoji: '⚽', size: 'big' },
    correctAnswer: 2,
    question: 'Which is bigger?',
  },
  {
    id: '5',
    type: 'longer',
    object1: { name: 'Short stick', emoji: '🪵', size: 'short' },
    object2: { name: 'Long stick', emoji: '🪵', size: 'long' },
    correctAnswer: 2,
    question: 'Which is longer?',
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

// Helper function to get wrong clock options
export function getClockOptions(correctHour: number): number[] {
  const allHours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const wrongOptions = allHours.filter((h) => h !== correctHour);
  return shuffleArray([correctHour, ...shuffleArray(wrongOptions).slice(0, 2)]);
}
