import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/shared/Session2UI';

export const TIMED_TARGET_THEME: Session2ThemeTokens = {
  sky: ['#ECFDF5', '#D1FAE5', '#A7F3D0', '#6EE7B7'],
  title: '#065F46',
  subtitle: '#047857',
  accent: '#10B981',
  accentDark: '#059669',
  hudGlass: 'rgba(255,255,255,0.85)',
  hudBorder: 'rgba(16,185,129,0.4)',
  cue: '#064E3B',
};

export const TIMED_TARGET_COPY = {
  title: 'Timed Target',
  emoji: '⏱️',
  tagline: 'Beat the Clock · Speed + Accuracy',
  body: 'A target appears with a shrinking time ring. Tap it before the clock runs out — stay fast AND accurate!',
  chips: ['⏱️ Speed', '🎯 Tap', '💨 Rush'],
  startLabel: 'Start Race',
  ttsIntro: 'Tap quickly before time runs out!',
  ttsSuccess: 'Fast hit!',
  ttsComplete: 'Lightning reflexes! You beat the clock!',
  congrats: 'Speed Champion!',
  logType: 'timed-target',
  skillTags: ['speed', 'accuracy', 'reaction-time', 'time-pressure'],
} as const;

export const TARGET_SIZE = 64;
export const TIME_LIMIT_MS = 3000;
