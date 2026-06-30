/**
 * Design tokens — OT Level 5 Session 4 · Game 1 · Star Safari
 * Palette: night safari sky + golden star gems
 */

export const STAR_SAFARI_THEME = {
  sky: ['#0C1445', '#1E1B4B', '#312E81', '#4C1D95'] as const,
  horizon: 'rgba(79,70,229,0.25)',
  acacia: '#1E293B',
  moon: '#FEF9C3',
  moonGlow: 'rgba(254,249,195,0.2)',
  starGold: '#FBBF24',
  starCore: '#FDE047',
  starGlow: 'rgba(251,191,36,0.55)',
  gemBg: 'rgba(255,255,255,0.92)',
  gemBorder: '#F59E0B',
  distractorBg: 'rgba(255,255,255,0.78)',
  distractorBorder: 'rgba(255,255,255,0.45)',
  wrong: '#F87171',
  wrongGlow: 'rgba(248,113,113,0.35)',
  hudGlass: 'rgba(15,23,42,0.88)',
  hudBorder: 'rgba(251,191,36,0.4)',
  title: '#FDE68A',
  subtitle: '#FCD34D',
  accent: '#FBBF24',
  accentDark: '#D97706',
  success: '#34D399',
} as const;

export const STAR_SAFARI_COPY = {
  title: 'Star Safari',
  emoji: '⭐',
  subtitle: 'Night Sky · Visual Scanning',
  introDescription:
    'Golden stars are hiding among colorful objects in the night safari sky. Scan the field and tap every star you find!',
  skills: ['Visual scanning', 'Selective attention', 'Object recognition', 'Search strategy'],
  ttsIntro: 'Welcome to Star Safari! Find every hidden star in the night sky!',
  ttsRound: (n: number) => `Find all ${n} stars!`,
  ttsFound: (remaining: number) =>
    remaining === 1 ? 'One more star to find!' : `${remaining} more stars to find!`,
  ttsSuccess: 'All stars found!',
  ttsWrong: 'That is not a star! Keep searching!',
  ttsComplete: 'Amazing! You hunted every star in the safari!',
  congratsMessage: 'Star Hunter!',
  logType: 'find-the-star',
  skillTags: ['visual-scanning', 'attention', 'object-recognition'],
  huntHint: (found: number, needed: number) => `⭐ Find stars · ${found}/${needed}`,
} as const;
