/**
 * OT Level 7 · Session 10 — "Vestibular Challenge Course"
 * Grand-finale palette (deep space black → royal indigo → vivid cyan → champion gold).
 */

export type ChallengeMode = 'pirateIsland' | 'spaceExplorer' | 'jungleExpedition' | 'mountainAdventure' | 'vestibularChampion';

export const CHALLENGE_SHELL = {
  gradient: ['#0C0A1D', '#3730A3', '#06B6D4', '#FBBF24'] as [string, string, string, string],
  backText: '#C7D2FE',
  backBorder: 'rgba(199,210,254,0.35)',
  titleColor: '#FFFFFF',
  subtitleColor: '#A5B4FC',
  statLabel: '#818CF8',
  statValue: '#FEF3C7',
  statBorder: 'rgba(129,140,248,0.4)',
  stageBorder: 'rgba(129,140,248,0.45)',
  stageBg: 'rgba(12,10,29,0.55)',
  gold: '#FBBF24',
  good: '#34D399',
  warn: '#FB7185',
  sparkleColor: '#A5B4FC',
} as const;

export type ChallengeGameTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  glow: string;
  hintText: string;
  voiceIntro: string;
  voiceComplete: string;
  congrats: string;
  /** Show the stepping path overlay. */
  showTrail?: boolean;
};

export const CHALLENGE_GAME_THEMES: Record<ChallengeMode, ChallengeGameTheme> = {
  pirateIsland: {
    title: 'Pirate Island Challenge',
    subtitle: 'Complete the treasure-hunt course across pirate island!',
    emoji: '🏴',
    hero: '🏴‍☠️',
    accent: '#34D399',
    accentDeep: '#047857',
    glow: 'rgba(52,211,153,0.55)',
    hintText: 'Move, turn and balance through the treasure course!',
    voiceIntro: 'Ahoy! Complete the pirate treasure-hunt course with great balance!',
    voiceComplete: 'You found the treasure! A true pirate explorer!',
    congrats: 'Pirate Island Champion!',
    showTrail: true,
  },
  spaceExplorer: {
    title: 'Space Explorer Course',
    subtitle: 'Navigate space-themed balance missions!',
    emoji: '🚀',
    hero: '🚀',
    accent: '#818CF8',
    accentDeep: '#4338CA',
    glow: 'rgba(129,140,248,0.5)',
    hintText: 'Follow each space mission — move, turn and balance!',
    voiceIntro: 'Space explorer! Navigate every balance mission across the galaxy!',
    voiceComplete: 'Mission complete! You explored the whole galaxy!',
    congrats: 'Space Explorer Champion!',
  },
  jungleExpedition: {
    title: 'Jungle Expedition',
    subtitle: 'Cross jungle obstacles using your vestibular skills!',
    emoji: '🌴',
    hero: '🐯',
    accent: '#22C55E',
    accentDeep: '#15803D',
    glow: 'rgba(34,197,94,0.5)',
    hintText: 'Move around each jungle obstacle and keep your balance!',
    voiceIntro: 'Jungle expedition! Cross every obstacle using your balance skills!',
    voiceComplete: 'You crossed the whole jungle! Amazing expedition!',
    congrats: 'Jungle Expedition Champion!',
    showTrail: true,
  },
  mountainAdventure: {
    title: 'Mountain Adventure',
    subtitle: 'Climb, turn and balance through the mountain paths!',
    emoji: '⛰️',
    hero: '🧗',
    accent: '#38BDF8',
    accentDeep: '#0369A1',
    glow: 'rgba(56,189,248,0.5)',
    hintText: 'Climb the mountain — move, turn and balance the whole way!',
    voiceIntro: 'Mountain adventure! Climb, turn and balance all the way to the top!',
    voiceComplete: 'You reached the summit! Incredible mountain balance!',
    congrats: 'Mountain Adventure Champion!',
  },
  vestibularChampion: {
    title: 'Vestibular Champion',
    subtitle: 'The final integrated vestibular obstacle course — go for gold!',
    emoji: '🏆',
    hero: '🏆',
    accent: '#FBBF24',
    accentDeep: '#B45309',
    glow: 'rgba(251,191,36,0.55)',
    hintText: 'This is the final course — use every skill to become Champion!',
    voiceIntro: 'This is the final challenge! Use every balance skill to become the Vestibular Champion!',
    voiceComplete: 'You are the Vestibular Champion! You mastered Level 7!',
    congrats: 'Vestibular Champion!',
  },
};
