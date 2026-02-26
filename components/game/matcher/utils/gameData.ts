// Game data for The Matcher - Level 2

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
    id: 'sound-to-picture',
    name: 'Sound to Picture Match',
    description: 'Listen to a sound and find the picture that starts with it',
    skillFocus: ['Beginning Sound Identification', 'Auditory Discrimination', 'One-to-One Mapping'],
    ageRange: '3-5 years',
    difficulty: 'easy',
    duration: '5-8 min',
  },
  {
    id: 'letter-to-sound',
    name: 'Letter to Sound Match',
    description: 'Match letters to their sounds',
    skillFocus: ['Letter-Sound Association', 'Sound Recognition', 'Visual-Auditory Linking'],
    ageRange: '4-6 years',
    difficulty: 'medium',
    duration: '6-10 min',
  },
  {
    id: 'sound-counting',
    name: 'Sound Counting Match',
    description: 'Count sounds in words and match with numbers',
    skillFocus: ['Phoneme Segmentation', 'Sound Counting', 'One-to-One Sound Mapping'],
    ageRange: '5-7 years',
    difficulty: 'hard',
    duration: '8-12 min',
  },
  {
    id: 'picture-pair',
    name: 'Picture Pair Sound Match',
    description: 'Match pictures that start with the same sound',
    skillFocus: ['Sound Comparison', 'Auditory Memory', 'Matching Logic'],
    ageRange: '4-6 years',
    difficulty: 'medium',
    duration: '7-10 min',
  },
  {
    id: 'rapid-match',
    name: 'Rapid Sound Match Challenge',
    description: 'Fast-paced sound matching with moving objects',
    skillFocus: ['Processing Speed', 'Auditory Processing', 'Coordination + Sound Linking'],
    ageRange: '5-7 years',
    difficulty: 'hard',
    duration: '5-8 min',
  },
];

// Sound to picture data
export interface SoundPictureItem {
  sound: string;
  phoneme: string;
  correctImage: string;
  wrongImages: string[];
  word: string;
}

export const SOUND_PICTURE_DATA: SoundPictureItem[] = [
  {
    sound: '/b/',
    phoneme: '/b/',
    correctImage: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=400',
    wrongImages: [
      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    ],
    word: 'ball',
  },
  {
    sound: '/k/',
    phoneme: '/k/',
    correctImage: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400',
    wrongImages: [
      'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=400',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    ],
    word: 'cat',
  },
  {
    sound: '/s/',
    phoneme: '/s/',
    correctImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    wrongImages: [
      'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=400',
      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400',
    ],
    word: 'sun',
  },
  {
    sound: '/d/',
    phoneme: '/d/',
    correctImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    wrongImages: [
      'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=400',
      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400',
    ],
    word: 'dog',
  },
  {
    sound: '/m/',
    phoneme: '/m/',
    correctImage: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=400',
    wrongImages: [
      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    ],
    word: 'moon',
  },
];

// Letter to sound data
export interface LetterSoundItem {
  letter: string;
  correctSound: string;
  wrongSounds: string[];
}

export const LETTER_SOUND_DATA: LetterSoundItem[] = [
  { letter: 'B', correctSound: '/b/', wrongSounds: ['/m/', '/s/'] },
  { letter: 'P', correctSound: '/p/', wrongSounds: ['/t/', '/k/'] },
  { letter: 'M', correctSound: '/m/', wrongSounds: ['/n/', '/l/'] },
  { letter: 'D', correctSound: '/d/', wrongSounds: ['/t/', '/b/'] },
  { letter: 'T', correctSound: '/t/', wrongSounds: ['/d/', '/k/'] },
  { letter: 'S', correctSound: '/s/', wrongSounds: ['/z/', '/sh/'] },
  { letter: 'K', correctSound: '/k/', wrongSounds: ['/g/', '/t/'] },
  { letter: 'F', correctSound: '/f/', wrongSounds: ['/v/', '/th/'] },
];

// Sound counting data
export interface SoundCountItem {
  word: string;
  soundCount: number;
  sounds: string[];
}

export const SOUND_COUNT_DATA: SoundCountItem[] = [
  { word: 'cat', soundCount: 3, sounds: ['/k/', '/a/', '/t/'] },
  { word: 'dog', soundCount: 3, sounds: ['/d/', '/o/', '/g/'] },
  { word: 'sun', soundCount: 3, sounds: ['/s/', '/u/', '/n/'] },
  { word: 'ball', soundCount: 3, sounds: ['/b/', '/a/', '/l/'] },
  { word: 'fish', soundCount: 3, sounds: ['/f/', '/i/', '/sh/'] },
  { word: 'book', soundCount: 3, sounds: ['/b/', '/u/', '/k/'] },
  { word: 'tree', soundCount: 3, sounds: ['/t/', '/r/', '/e/'] },
  { word: 'moon', soundCount: 3, sounds: ['/m/', '/u/', '/n/'] },
];

// Picture pair data
export interface PicturePairItem {
  image1: string;
  image2: string;
  sound: string;
  word1: string;
  word2: string;
}

export const PICTURE_PAIR_DATA: PicturePairItem[] = [
  {
    image1: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=400',
    image2: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    sound: '/b/',
    word1: 'ball',
    word2: 'bat',
  },
  {
    image1: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400',
    image2: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    sound: '/k/',
    word1: 'cat',
    word2: 'car',
  },
  {
    image1: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    image2: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=400',
    sound: '/s/',
    word1: 'sun',
    word2: 'star',
  },
];

// Helper functions
export function getOptionsCount(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy':
      return 2;
    case 'medium':
      return 3;
    case 'hard':
      return 4;
  }
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
