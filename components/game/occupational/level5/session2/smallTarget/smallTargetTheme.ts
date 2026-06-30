import type { Session2Copy, Session2GameMeta, Session2ThemeTokens } from '@/components/game/occupational/level5/session2/session2Theme';

export const SMALL_TARGET_THEME: Session2ThemeTokens = {
  sky: ['#FEF3C7', '#FDE68A', '#FCD34D', '#FBBF24'],
  title: '#92400E',
  subtitle: '#B45309',
  accent: '#EF4444',
  accentDark: '#B91C1C',
  hudGlass: 'rgba(255,255,255,0.85)',
  hudBorder: 'rgba(251,191,36,0.5)',
  cue: '#7C2D12',
};

export const SMALL_TARGET_COPY: Session2Copy = {
  title: 'Archery Range',
  emoji: '🎯',
  tagline: 'Archery Range · Finger Precision',
  body: 'A tiny bullseye appears on the range. Aim carefully and tap the center — precision matters more than speed!',
  chips: ['🎯 Aim', '👆 Precise', '💪 Control'],
  startLabel: 'Enter Range',
  ttsIntro: 'Tap the tiny bullseye!',
  ttsSuccess: 'Bullseye!',
  ttsComplete: 'Incredible precision! You are a sharpshooter!',
  congrats: 'Sharpshooter!',
  logType: 'small-target',
  skillTags: ['finger-precision', 'fine-motor-control', 'accuracy'],
};

export const SMALL_TARGET_META: Session2GameMeta = {
  startGradient: ['#EF4444', '#DC2626', '#B91C1C'],
  hudTitle: 'Bullseye',
  scoreLabel: 'HITS',
};

export const BULLSEYE_SIZE = 36;
