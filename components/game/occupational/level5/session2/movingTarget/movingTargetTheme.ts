import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/shared/Session2UI';

export const MOVING_TARGET_THEME: Session2ThemeTokens = {
  sky: ['#0F172A', '#1E1B4B', '#312E81', '#1E293B'],
  title: '#E0E7FF',
  subtitle: '#A5B4FC',
  accent: '#22D3EE',
  accentDark: '#06B6D4',
  hudGlass: 'rgba(15,23,42,0.75)',
  hudBorder: 'rgba(34,211,238,0.35)',
  cue: '#67E8F9',
};

export const MOVING_TARGET_COPY = {
  title: 'Moving Target',
  emoji: '⚡',
  tagline: 'Neon Arcade · Timing Control',
  body: 'A glowing orb zips across the neon grid. Track it with your eyes and tap at the right moment — it speeds up as you improve!',
  chips: ['⚡ Speed', '👀 Track', '🎯 Tap'],
  startLabel: 'Power On',
  ttsComplete: 'Elite timing! You crushed the arcade!',
  congrats: 'Arcade Ace!',
  logType: 'moving-target',
  skillTags: ['timing-control', 'hand-eye-coordination', 'reaction-time'],
} as const;
