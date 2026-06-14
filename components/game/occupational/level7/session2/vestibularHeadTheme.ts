/**
 * OT Level 7 · Session 2 — "Head Movement & Vestibular Activation"
 * Warm sunrise-sky palette (dawn indigo → coral → gold → sky cyan) — distinct
 * from Level 6 cosmic navy and Level 7 Session 1 railway amber.
 */

export type VestibularHeadMode =
  | 'lookUpExplorer'
  | 'skyGroundMission'
  | 'helicopterWatch'
  | 'starTracker'
  | 'turnAndFind';

export const VESTIBULAR_HEAD_SHELL = {
  gradient: ['#1E1033', '#7C2D12', '#EA580C', '#38BDF8'] as [string, string, string, string],
  backText: '#FEF3C7',
  backBorder: 'rgba(254,243,199,0.35)',
  titleColor: '#FFFFFF',
  subtitleColor: '#FDE68A',
  statLabel: '#FCD34D',
  statValue: '#FFFBEB',
  statBorder: 'rgba(252,211,77,0.4)',
  stageBorder: 'rgba(251,191,36,0.45)',
  stageBg: 'rgba(30,16,51,0.55)',
  gold: '#FBBF24',
  good: '#34D399',
  warn: '#FB7185',
  sparkleColor: '#FDE68A',
} as const;

export type VestibularHeadTheme = {
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
};

export const VESTIBULAR_HEAD_THEMES: Record<VestibularHeadMode, VestibularHeadTheme> = {
  lookUpExplorer: {
    title: 'Look Up Explorer',
    subtitle: 'Explore the sky — look up to find hidden treasures in the clouds!',
    emoji: '👀',
    hero: '☁️',
    accent: '#38BDF8',
    accentDeep: '#0369A1',
    glow: 'rgba(56,189,248,0.55)',
    hintText: 'Look UP toward the treasure — keep your body balanced and still!',
    voiceIntro: 'Explore the sky! Look up to find hidden treasures in the clouds!',
    voiceComplete: 'You found every sky treasure! Amazing looking up!',
    congrats: 'Sky Explorer Champion!',
  },
  skyGroundMission: {
    title: 'Sky-Ground Mission',
    subtitle: 'Search for clues in the sky and on the ground!',
    emoji: '🌞',
    hero: '🔍',
    accent: '#F59E0B',
    accentDeep: '#B45309',
    glow: 'rgba(245,158,11,0.5)',
    hintText: 'Look UP at the sky, then DOWN at the ground — smooth and controlled!',
    voiceIntro: 'Mission start! Alternate looking up at the sky and down at the ground!',
    voiceComplete: 'All clues collected! Great sky-ground searching!',
    congrats: 'Sky-Ground Mission Hero!',
  },
  helicopterWatch: {
    title: 'Helicopter Watch',
    subtitle: 'Follow helicopters flying across the sky with smooth head movements!',
    emoji: '🚁',
    hero: '🚁',
    accent: '#22D3EE',
    accentDeep: '#0E7490',
    glow: 'rgba(34,211,238,0.5)',
    hintText: 'Track the helicopter with your head — keep your trunk still!',
    voiceIntro: 'Helicopters incoming! Follow them smoothly with your head!',
    voiceComplete: 'Perfect tracking! You followed every helicopter!',
    congrats: 'Helicopter Tracking Ace!',
  },
  starTracker: {
    title: 'Star Tracker',
    subtitle: 'Follow magical stars moving in different directions!',
    emoji: '⭐',
    hero: '✨',
    accent: '#A78BFA',
    accentDeep: '#6D28D9',
    glow: 'rgba(167,139,250,0.55)',
    hintText: 'Smoothly follow each star — left, right, up and down!',
    voiceIntro: 'Magical stars ahead! Follow them with your head in every direction!',
    voiceComplete: 'Stellar vestibular work! You tracked every star!',
    congrats: 'Vestibular Star Master!',
  },
  turnAndFind: {
    title: 'Turn & Find',
    subtitle: 'Turn your head left and right to find hidden targets!',
    emoji: '🎯',
    hero: '🎯',
    accent: '#F472B6',
    accentDeep: '#BE185D',
    glow: 'rgba(244,114,182,0.5)',
    hintText: 'Turn your head to find each target — stay balanced!',
    voiceIntro: 'Hidden targets are nearby! Turn your head left and right to find them!',
    voiceComplete: 'You found every target! Great head turning!',
    congrats: 'Target Finder Champion!',
  },
};
