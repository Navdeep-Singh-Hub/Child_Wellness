// Game data for The Grouper - Level 1 Session 4

export type Difficulty = 'easy' | 'medium' | 'hard';
export type WordFamily = '-at' | '-in' | '-un';

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
    id: 'word-family-sort',
    name: 'Word Family Sort',
    description: 'Drag words into the correct word family baskets',
    skillFocus: ['Rhyming Awareness', 'Word Family Recognition', 'Classification'],
    ageRange: '4-6 years',
    difficulty: 'easy',
    duration: '2-4 min',
  },
  {
    id: 'picture-to-family',
    name: 'Picture to Word Family',
    description: 'Match pictures to their word family endings',
    skillFocus: ['Sound Pattern Recognition', 'Beginning Word Blending', 'Visual-Auditory Linking'],
    ageRange: '4-6 years',
    difficulty: 'easy',
    duration: '2-4 min',
  },
  {
    id: 'odd-one-out',
    name: 'Odd One Out',
    description: 'Find the word that does not belong to the group',
    skillFocus: ['Classification', 'Pattern Recognition', 'Attention to Detail'],
    ageRange: '4-6 years',
    difficulty: 'medium',
    duration: '2-4 min',
  },
  {
    id: 'family-builder',
    name: 'Family Builder',
    description: 'Build words by combining beginning letters with word family endings',
    skillFocus: ['Word Construction', 'Family Pattern Understanding', 'Logical Grouping'],
    ageRange: '4-6 years',
    difficulty: 'medium',
    duration: '2-4 min',
  },
  {
    id: 'speed-sort',
    name: 'Speed Sort Challenge',
    description: 'Quickly sort falling words into their word families',
    skillFocus: ['Fast Classification', 'Pattern Recall', 'Focus'],
    ageRange: '4-6 years',
    difficulty: 'medium',
    duration: '2-4 min',
  },
];

// Word families data
export interface WordFamilyData {
  family: WordFamily;
  words: string[];
  color: string;
}

export const WORD_FAMILIES: WordFamilyData[] = [
  {
    family: '-at',
    words: ['cat', 'bat', 'hat', 'rat', 'mat', 'sat'],
    color: '#A5B4FC',
  },
  {
    family: '-in',
    words: ['pin', 'bin', 'tin', 'win', 'fin', 'sin'],
    color: '#FBCFE8',
  },
  {
    family: '-un',
    words: ['sun', 'run', 'bun', 'fun', 'gun', 'pun'],
    color: '#99F6E4',
  },
];

// Picture to word family data
export interface PictureFamilyItem {
  picture: string;
  word: string;
  family: WordFamily;
  wrongFamilies: WordFamily[];
}

export const PICTURE_FAMILY_DATA: PictureFamilyItem[] = [
  {
    picture: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400',
    word: 'cat',
    family: '-at',
    wrongFamilies: ['-in', '-un'],
  },
  {
    picture: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400',
    word: 'bat',
    family: '-at',
    wrongFamilies: ['-in', '-un'],
  },
  {
    picture: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=400',
    word: 'hat',
    family: '-at',
    wrongFamilies: ['-in', '-un'],
  },
  {
    picture: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400',
    word: 'pin',
    family: '-in',
    wrongFamilies: ['-at', '-un'],
  },
  {
    picture: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    word: 'sun',
    family: '-un',
    wrongFamilies: ['-at', '-in'],
  },
];

// Odd one out data
export interface OddOneOutItem {
  words: string[];
  oddWord: string;
  family: WordFamily;
}

export const ODD_ONE_OUT_DATA: OddOneOutItem[] = [
  {
    words: ['cat', 'bat', 'pin'],
    oddWord: 'pin',
    family: '-at',
  },
  {
    words: ['pin', 'bin', 'cat'],
    oddWord: 'cat',
    family: '-in',
  },
  {
    words: ['sun', 'run', 'bat'],
    oddWord: 'bat',
    family: '-un',
  },
  {
    words: ['hat', 'rat', 'bin'],
    oddWord: 'bin',
    family: '-at',
  },
  {
    words: ['tin', 'win', 'sun'],
    oddWord: 'sun',
    family: '-in',
  },
];

// Family builder data
export interface FamilyBuilderItem {
  family: WordFamily;
  correctBeginnings: string[];
  wrongBeginnings: string[];
}

export const FAMILY_BUILDER_DATA: FamilyBuilderItem[] = [
  {
    family: '-at',
    correctBeginnings: ['c', 'b', 'h', 'r'],
    wrongBeginnings: ['p', 's', 'w'],
  },
  {
    family: '-in',
    correctBeginnings: ['p', 'b', 't', 'w'],
    wrongBeginnings: ['c', 'h', 'r'],
  },
  {
    family: '-un',
    correctBeginnings: ['s', 'r', 'b', 'f'],
    wrongBeginnings: ['c', 'p', 't'],
  },
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

export function getWordFamily(word: string): WordFamily | null {
  if (word.endsWith('at')) return '-at';
  if (word.endsWith('in')) return '-in';
  if (word.endsWith('un')) return '-un';
  return null;
}

export function getAllWords(): string[] {
  return WORD_FAMILIES.flatMap(family => family.words);
}
