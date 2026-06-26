/**
 * OT Level 6 · Session 2 · Game 2 — Crown Keeper (head stability via face landmarks)
 */
export const CROWN_KEEPER_THEME = {
  gradient: ['#1A0F2E', '#4C1D95', '#7C3AED', '#DB2777'] as [string, string, string, string],
  backText: '#F5D0FE',
  backBorder: 'rgba(245,208,254,0.35)',
  titleColor: '#FFFFFF',
  subtitleColor: '#E9D5FF',
  accent: '#FBBF24',
  accentDeep: '#B45309',
  glow: 'rgba(251,191,36,0.55)',
  stageBorder: 'rgba(251,191,36,0.45)',
  stageBg: 'rgba(15,12,41,0.55)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FDE68A',
  glassBorder: 'rgba(233,213,255,0.35)',
  title: 'Crown Keeper',
  subtitle: 'Keep your royal crown steady — do not let it fall!',
  emoji: '👑',
  hero: '👑',
  hintText: 'Look straight ahead and hold very still.',
  voiceIntro: 'Wear the magical crown. Keep your head steady so it never falls!',
  voiceComplete: 'Magnificent! You are the true Crown Keeper!',
  congrats: 'Royal Crown Keeper!',
} as const;

export type CrownDifficulty = 'easy' | 'medium' | 'hard';

export const CROWN_DIFFICULTY_LABELS: Record<CrownDifficulty, { label: string; degrees: number }> = {
  easy: { label: 'Easy · 15°', degrees: 15 },
  medium: { label: 'Medium · 8°', degrees: 8 },
  hard: { label: 'Hard · 4°', degrees: 4 },
};
