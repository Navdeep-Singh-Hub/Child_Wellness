// Game data for The Builder - Level 1 Session 3

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
    id: 'listen-tap',
    name: 'Listen & Tap',
    description: 'Listen to a sound and tap the picture that starts with it',
    skillFocus: ['Sound Awareness', 'Listening Skills', 'One-to-One Sound Matching'],
    ageRange: '3-5 years',
    difficulty: 'easy',
    duration: '2-3 min',
  },
  {
    id: 'build-word',
    name: 'Build the Word',
    description: 'Drag letters to build simple words',
    skillFocus: ['Letter Recognition', 'Word Sequencing', 'Fine Motor Control'],
    ageRange: '3-5 years',
    difficulty: 'easy',
    duration: '2-3 min',
  },
  {
    id: 'shape-match',
    name: 'Shape Match',
    description: 'Match shapes by dragging them into place',
    skillFocus: ['Shape Identification', 'Visual Matching', 'Hand Control'],
    ageRange: '3-5 years',
    difficulty: 'easy',
    duration: '2-3 min',
  },
  {
    id: 'simple-symmetry',
    name: 'Simple Symmetry',
    description: 'Find the matching half to complete the shape',
    skillFocus: ['Basic Symmetry Awareness', 'Visual Attention'],
    ageRange: '3-5 years',
    difficulty: 'easy',
    duration: '2-3 min',
  },
  {
    id: 'mini-builder-mix',
    name: 'Mini Builder Mix',
    description: 'A fun mix of sounds, words, and shapes',
    skillFocus: ['Sound Recognition', 'Word Building', 'Shape Matching'],
    ageRange: '3-5 years',
    difficulty: 'easy',
    duration: '2-3 min',
  },
];

// Listen & Tap game data
export interface ListenTapItem {
  sound: string;
  phoneme: string;
  correctImage: string;
  wrongImage: string;
  word: string;
}

export const LISTEN_TAP_DATA: ListenTapItem[] = [
  {
    sound: '/c/',
    phoneme: '/k/',
    correctImage: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400',
    wrongImage: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=400',
    word: 'cat',
  },
  {
    sound: '/b/',
    phoneme: '/b/',
    correctImage: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=400',
    wrongImage: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400',
    word: 'ball',
  },
  {
    sound: '/d/',
    phoneme: '/d/',
    correctImage: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
    wrongImage: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400',
    word: 'dog',
  },
  {
    sound: '/s/',
    phoneme: '/s/',
    correctImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    wrongImage: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=400',
    word: 'sun',
  },
  {
    sound: '/b/',
    phoneme: '/b/',
    correctImage: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400',
    wrongImage: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400',
    word: 'bat',
  },
];

// Build the Word game data
export interface BuildWordItem {
  word: string;
  image: string;
  letters: string[];
  phonemes: string[];
}

export const BUILD_WORD_DATA: BuildWordItem[] = [
  {
    word: 'cat',
    image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400',
    letters: ['c', 'a', 't'],
    phonemes: ['/k/', '/a/', '/t/'],
  },
  {
    word: 'dog',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
    letters: ['d', 'o', 'g'],
    phonemes: ['/d/', '/o/', '/g/'],
  },
  {
    word: 'bat',
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400',
    letters: ['b', 'a', 't'],
    phonemes: ['/b/', '/a/', '/t/'],
  },
  {
    word: 'sun',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    letters: ['s', 'u', 'n'],
    phonemes: ['/s/', '/u/', '/n/'],
  },
  {
    word: 'hat',
    image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400',
    letters: ['h', 'a', 't'],
    phonemes: ['/h/', '/a/', '/t/'],
  },
];

// Shape Match game data
export type ShapeType = 'circle' | 'square' | 'triangle';

export interface ShapeMatchItem {
  targetShape: ShapeType;
  options: ShapeType[];
}

export const SHAPE_MATCH_DATA: ShapeMatchItem[] = [
  { targetShape: 'circle', options: ['circle', 'square', 'triangle'] },
  { targetShape: 'square', options: ['circle', 'square', 'triangle'] },
  { targetShape: 'triangle', options: ['circle', 'square', 'triangle'] },
  { targetShape: 'circle', options: ['circle', 'square', 'triangle'] },
  { targetShape: 'square', options: ['circle', 'square', 'triangle'] },
];

// Simple Symmetry game data
export interface SymmetryItem {
  shape: 'circle' | 'square' | 'triangle';
  correctHalf: number; // 0 or 1
}

export const SYMMETRY_DATA: SymmetryItem[] = [
  { shape: 'circle', correctHalf: 0 },
  { shape: 'square', correctHalf: 1 },
  { shape: 'triangle', correctHalf: 0 },
  { shape: 'circle', correctHalf: 1 },
  { shape: 'square', correctHalf: 0 },
];

// Utility functions
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
