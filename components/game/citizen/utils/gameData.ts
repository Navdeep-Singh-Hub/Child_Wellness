// Game data for The Citizen - Level 1 Session 8

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
    id: 'read-sign',
    name: 'Read the Sign',
    description: 'Tap the correct sign after hearing the audio',
    skillFocus: ['Functional Reading', 'Environmental Print Recognition', 'Attention'],
    ageRange: '5-7 years',
    difficulty: 'easy',
    duration: '3-4 min',
  },
  {
    id: 'where-do-you-see',
    name: 'Where Do You See This?',
    description: 'Select the correct location for each sign',
    skillFocus: ['Meaning Association', 'Logical Thinking', 'Real-World Linking'],
    ageRange: '5-7 years',
    difficulty: 'easy',
    duration: '3-4 min',
  },
  {
    id: 'coin-recognition',
    name: 'Coin Recognition',
    description: 'Identify the correct coin value',
    skillFocus: ['Money Identification', 'Symbol Recognition', 'Visual Matching'],
    ageRange: '5-7 years',
    difficulty: 'easy',
    duration: '3-4 min',
  },
  {
    id: 'count-coins',
    name: 'Count the Coins',
    description: 'Count coins and find the total value',
    skillFocus: ['Addition with Money', 'One-to-One Counting', 'Value Understanding'],
    ageRange: '5-7 years',
    difficulty: 'easy',
    duration: '3-4 min',
  },
  {
    id: 'mini-shop',
    name: 'Mini Shop Game',
    description: 'Drag coins to pay for items',
    skillFocus: ['Value Matching', 'Logical Reasoning', 'Early Financial Awareness'],
    ageRange: '5-7 years',
    difficulty: 'easy',
    duration: '3-4 min',
  },
];

// Functional signs data
export interface Sign {
  id: string;
  text: string;
  color: string;
  backgroundColor: string;
}

export const SIGNS: Sign[] = [
  { id: '1', text: 'STOP', color: '#FFFFFF', backgroundColor: '#DC2626' },
  { id: '2', text: 'EXIT', color: '#FFFFFF', backgroundColor: '#059669' },
  { id: '3', text: 'SCHOOL', color: '#FFFFFF', backgroundColor: '#2563EB' },
  { id: '4', text: 'HOSPITAL', color: '#FFFFFF', backgroundColor: '#DC2626' },
];

// Sign location associations
export interface SignLocation {
  signId: string;
  correctLocation: string;
  options: string[];
}

export const SIGN_LOCATIONS: SignLocation[] = [
  {
    signId: '2', // EXIT
    correctLocation: 'Door',
    options: ['Door', 'Tree', 'Car'],
  },
  {
    signId: '3', // SCHOOL
    correctLocation: 'Building',
    options: ['Building', 'Park', 'Car'],
  },
  {
    signId: '4', // HOSPITAL
    correctLocation: 'Building',
    options: ['Building', 'Tree', 'Car'],
  },
  {
    signId: '1', // STOP
    correctLocation: 'Road',
    options: ['Road', 'Park', 'Door'],
  },
];

// Indian coins data
export type CoinValue = 1 | 2 | 5 | 10;

export interface Coin {
  value: CoinValue;
  symbol: string;
  color: string;
  name: string;
}

export const COINS: Coin[] = [
  { value: 1, symbol: '₹1', color: '#FDE68A', name: 'One Rupee' },
  { value: 2, symbol: '₹2', color: '#FDE68A', name: 'Two Rupees' },
  { value: 5, symbol: '₹5', color: '#FDE68A', name: 'Five Rupees' },
  { value: 10, symbol: '₹10', color: '#FDE68A', name: 'Ten Rupees' },
];

// Coin counting problems
export interface CoinCountProblem {
  id: string;
  coins: CoinValue[];
  answer: number;
}

export const COIN_COUNT_PROBLEMS: CoinCountProblem[] = [
  { id: '1', coins: [2, 1, 2], answer: 5 },
  { id: '2', coins: [1, 1, 2], answer: 4 },
  { id: '3', coins: [5, 2, 1], answer: 8 },
  { id: '4', coins: [2, 2, 1], answer: 5 },
  { id: '5', coins: [5, 1, 1], answer: 7 },
  { id: '6', coins: [2, 2, 2], answer: 6 },
  { id: '7', coins: [1, 1, 1, 2], answer: 5 },
];

// Shop items
export interface ShopItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  { id: '1', name: 'Ball', price: 5, emoji: '⚽' },
  { id: '2', name: 'Book', price: 3, emoji: '📚' },
  { id: '3', name: 'Toy Car', price: 4, emoji: '🚗' },
  { id: '4', name: 'Crayon', price: 2, emoji: '🖍️' },
  { id: '5', name: 'Apple', price: 3, emoji: '🍎' },
  { id: '6', name: 'Pencil', price: 1, emoji: '✏️' },
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

// Helper function to get wrong coin options
export function getCoinOptions(correct: CoinValue): CoinValue[] {
  const allCoins: CoinValue[] = [1, 2, 5, 10];
  const wrongOptions = allCoins.filter((v) => v !== correct);
  return shuffleArray([correct, ...shuffleArray(wrongOptions).slice(0, 2)]);
}

// Helper function to get coin combinations for payment
export function getCoinCombination(total: number): CoinValue[] {
  const combinations: Record<number, CoinValue[]> = {
    1: [1],
    2: [2],
    3: [2, 1],
    4: [2, 2],
    5: [5],
    6: [5, 1],
    7: [5, 2],
    8: [5, 2, 1],
    9: [5, 2, 2],
    10: [10],
  };
  return combinations[total] || [total as CoinValue];
}
