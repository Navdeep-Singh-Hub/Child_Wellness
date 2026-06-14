/**
 * OT Level 6 · Session 2 — "Enchanted Kingdom (Standing Posture Control)"
 * Visual design tokens. A fresh sky→meadow→forest palette (cool calming greens
 * and sky-blues with warm golden-hour highlights) — grounded, growth-themed,
 * distinct from Session 1's cosmic superhero look.
 */

export type StandMode = 'tallTree' | 'soldier' | 'statueGuard' | 'growTaller' | 'freezeBalance';

export const FOREST_SHELL = {
  // 4-stop sky → meadow gradient.
  gradient: ['#0B2A4A', '#1D5C8C', '#3FA7A0', '#A7E8BD'] as [string, string, string, string],
  backText: '#DCFCE7',
  backBorder: 'rgba(220,252,231,0.35)',
  titleColor: '#FFFFFF',
  subtitleColor: '#BBF7D0',
  statLabel: '#5EEAD4',
  statValue: '#FEF9C3',
  statBorder: 'rgba(94,234,212,0.35)',
  stageBorder: 'rgba(94,234,212,0.45)',
  stageBg: 'rgba(8,30,38,0.5)',
  gold: '#FBBF24',
  good: '#34D399',
  warn: '#FB7185',
  sparkleColor: '#FDE68A',
  glassBorder: 'rgba(167,232,189,0.4)',
} as const;

export type StandGameTheme = {
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

export const STAND_GAME_THEMES: Record<StandMode, StandGameTheme> = {
  tallTree: {
    title: 'Tall Tree',
    subtitle: 'Stand tall and grow into a mighty magical tree!',
    emoji: '🌳',
    hero: '🌱',
    accent: '#22C55E',
    accentDeep: '#15803D',
    glow: 'rgba(34,197,94,0.55)',
    hintText: 'Stand up nice and tall — your tree grows higher and higher!',
    voiceIntro: 'Stand up tall like a strong tree growing to the sky!',
    voiceComplete: 'Your tree is huge and beautiful! Wonderful standing!',
    congrats: 'Mighty Tall Tree!',
  },
  soldier: {
    title: 'Soldier Stand',
    subtitle: 'Be a royal guard — follow every command perfectly!',
    emoji: '💂',
    hero: '🛡️',
    accent: '#F59E0B',
    accentDeep: '#B45309',
    glow: 'rgba(245,158,11,0.5)',
    hintText: 'Stand tall and steady — shoulders level, head straight!',
    voiceIntro: 'Royal guard, stand tall and follow each command!',
    voiceComplete: 'Outstanding, guard! The castle is safe!',
    congrats: 'Royal Guard Hero!',
  },
  statueGuard: {
    title: 'Statue Guard',
    subtitle: 'Freeze like a giant statue — do not move a muscle!',
    emoji: '🗽',
    hero: '🧍',
    accent: '#22D3EE',
    accentDeep: '#0E7490',
    glow: 'rgba(34,211,238,0.5)',
    hintText: 'Stay perfectly still — even your arms! Ignore the distractions!',
    voiceIntro: 'Become a giant statue. Stand as still as stone!',
    voiceComplete: 'Incredible stillness! A statue worthy of the kingdom!',
    congrats: 'Legendary Statue Guard!',
  },
  growTaller: {
    title: 'Grow Taller',
    subtitle: 'Stretch up high to float the balloon to the clouds!',
    emoji: '🎈',
    hero: '☁️',
    accent: '#F472B6',
    accentDeep: '#BE185D',
    glow: 'rgba(244,114,182,0.5)',
    hintText: 'Stretch up as TALL as you can — reach for the sky!',
    voiceIntro: 'Stretch up super tall and reach your arms to the sky!',
    voiceComplete: 'The balloon touched the clouds! Amazing stretching!',
    congrats: 'Sky-High Stretcher!',
  },
  freezeBalance: {
    title: 'Freeze & Balance',
    subtitle: 'March and move… then FREEZE and balance when signaled!',
    emoji: '🧊',
    hero: '🏃',
    accent: '#A78BFA',
    accentDeep: '#6D28D9',
    glow: 'rgba(167,139,250,0.55)',
    hintText: 'Move and march… when you see FREEZE, stop and balance still!',
    voiceIntro: 'March and move! When I say freeze, stop and balance!',
    voiceComplete: 'Super freezing and balancing! Great control!',
    congrats: 'Freeze & Balance Champion!',
  },
};
