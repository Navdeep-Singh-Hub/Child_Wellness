import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/shared/Session2UI';

export const POP_BUBBLE_THEME: Session2ThemeTokens = {
  sky: ['#CFFAFE', '#A5F3FC', '#67E8F9', '#22D3EE'],
  title: '#0E7490',
  subtitle: '#0891B2',
  accent: '#38BDF8',
  accentDark: '#0284C7',
  hudGlass: 'rgba(255,255,255,0.82)',
  hudBorder: 'rgba(255,255,255,0.55)',
  cue: '#0E7490',
};

export const POP_BUBBLE_COPY = {
  title: 'Pop the Bubble',
  emoji: '🫧',
  tagline: 'Bubble Garden · Tap Accuracy',
  body: 'A shimmering bubble floats in the sky garden. Tap it before it drifts away — each pop builds precise finger control!',
  chips: ['👆 Tap', '🫧 Pop', '🎯 Aim'],
  startLabel: 'Start Popping',
  ttsIntro: 'Tap the bubble to pop it!',
  ttsSuccess: 'Pop!',
  ttsComplete: 'Amazing popping! You are a bubble master!',
  congrats: 'Bubble Master!',
  logType: 'pop-the-bubble',
  skillTags: ['tap-accuracy', 'hand-eye-coordination', 'precision'],
} as const;

export const BUBBLE_SIZE = 88;
export const FRAGMENT_COLORS = ['#BAE6FD', '#7DD3FC', '#38BDF8', '#E0F2FE', '#FFFFFF', '#0EA5E9'];
