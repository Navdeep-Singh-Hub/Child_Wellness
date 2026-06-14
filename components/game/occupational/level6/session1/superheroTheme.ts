/**
 * OT Level 6 · Session 1 — "Superhero Power Academy"
 * Visual design tokens. Built on a cosmic indigo→violet→magenta base with
 * warm gold energy accents (high contrast, kid-friendly, color-theory balanced:
 * cool deep background + warm focal rewards draw the eye to the action).
 */

export type PostureMode = 'powerSit' | 'crown' | 'statue' | 'freeze' | 'reach';

/** Shared cosmic shell used by every game in the session. */
export const HERO_SHELL = {
  // 4-stop background gradient (deep space → nebula glow).
  gradient: ['#0B1026', '#1E1B4B', '#4C1D95', '#7C3AED'] as [string, string, string, string],
  backText: '#E9D5FF',
  backBorder: 'rgba(233,213,255,0.35)',
  titleColor: '#FFFFFF',
  subtitleColor: '#C4B5FD',
  statLabel: '#A78BFA',
  statValue: '#FDE68A',
  statBorder: 'rgba(167,139,250,0.35)',
  stageBorder: 'rgba(167,139,250,0.45)',
  stageBg: 'rgba(15,12,41,0.55)',
  gold: '#FBBF24',
  goldDeep: '#F59E0B',
  star: '#FDE68A',
  good: '#34D399',
  warn: '#FB7185',
  sparkleColor: '#FDE68A',
  glassBg: 'rgba(124,58,237,0.18)',
  glassBorder: 'rgba(196,181,253,0.4)',
} as const;

export type PostureGameTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string; // hero/character emoji
  accent: string;
  accentDeep: string;
  glow: string;
  hintText: string;
  voiceIntro: string;
  voiceComplete: string;
  congrats: string;
};

export const POSTURE_GAME_THEMES: Record<PostureMode, PostureGameTheme> = {
  powerSit: {
    title: 'Superhero Power Sit',
    subtitle: 'Sit tall to charge your super power!',
    emoji: '⚡',
    hero: '🦸',
    accent: '#F59E0B',
    accentDeep: '#B45309',
    glow: 'rgba(245,158,11,0.55)',
    hintText: 'Sit up tall and still — watch your power meter fill!',
    voiceIntro: 'Superhero, sit up nice and tall to charge your power!',
    voiceComplete: 'Power fully charged! You are a super sitter!',
    congrats: 'Power Sit Champion!',
  },
  crown: {
    title: 'Crown Keeper',
    subtitle: 'Keep your head steady to protect the magic crown!',
    emoji: '👑',
    hero: '🤴',
    accent: '#F472B6',
    accentDeep: '#BE185D',
    glow: 'rgba(244,114,182,0.55)',
    hintText: 'Hold your head straight and steady — keep the crown balanced!',
    voiceIntro: 'Keep your head straight and tall so the crown does not fall!',
    voiceComplete: 'You kept the crown safe! Royal job!',
    congrats: 'Royal Crown Keeper!',
  },
  statue: {
    title: 'Statue Kingdom',
    subtitle: 'Freeze like a royal statue — do not move!',
    emoji: '🗿',
    hero: '🧍',
    accent: '#22D3EE',
    accentDeep: '#0E7490',
    glow: 'rgba(34,211,238,0.5)',
    hintText: 'Stay perfectly still — ignore the silly distractions!',
    voiceIntro: 'Become a royal statue. Stay as still as you can!',
    voiceComplete: 'Amazing stillness! The kingdom is proud!',
    congrats: 'Master Statue!',
  },
  freeze: {
    title: 'Sit Tall Freeze',
    subtitle: 'Green sit tall · Yellow get ready · Red freeze!',
    emoji: '🚦',
    hero: '🦸‍♀️',
    accent: '#34D399',
    accentDeep: '#047857',
    glow: 'rgba(52,211,153,0.5)',
    hintText: 'Watch the light: GREEN sit tall, YELLOW ready, RED freeze!',
    voiceIntro: 'Follow the lights! Green sit tall, red freeze!',
    voiceComplete: 'Super reactions! You followed every light!',
    congrats: 'Freeze Master!',
  },
  reach: {
    title: 'Star Reach Mission',
    subtitle: 'Reach out to catch falling stars — stay balanced!',
    emoji: '🌟',
    hero: '🚀',
    accent: '#A78BFA',
    accentDeep: '#6D28D9',
    glow: 'rgba(167,139,250,0.55)',
    hintText: 'Reach toward each star, then sit back tall and balanced!',
    voiceIntro: 'Reach out and grab the stars, then sit back tall!',
    voiceComplete: 'You caught the stars and kept your balance! Stellar!',
    congrats: 'Star Catcher Hero!',
  },
};
