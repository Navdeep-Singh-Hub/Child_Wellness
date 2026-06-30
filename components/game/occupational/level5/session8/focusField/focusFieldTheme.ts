import type { TrackCopy, TrackThemeTokens } from '@/components/game/occupational/level5/session8/trackTheme';

export const FOCUS_FIELD_THEME: TrackThemeTokens = {
  sky: ['#14532D', '#166534', '#15803D', '#22C55E'],
  hudGlass: 'rgba(20,83,45,0.9)',
  hudBorder: 'rgba(74,222,128,0.4)',
  title: '#BBF7D0',
  subtitle: '#86EFAC',
  accent: '#4ADE80',
  accentDark: '#22C55E',
};

export const FOCUS_FIELD_COPY: TrackCopy = {
  title: 'Focus Field',
  emoji: '🎯',
  subtitle: 'Distraction Grid · Focus Under Load',
  introDescription: 'A bullseye hides among gray decoys. Tap the target and ignore every distraction around it!',
  ttsComplete: 'Laser focus! You ignored every distraction!',
  congratsMessage: 'Focus Master!',
};

export const FOCUS_FIELD_META = {
  rootBg: '#14532D',
  chips: ['🎯 Target', '🚫 Ignore', '👆 Focus'] as const,
  startLabel: '🎯 Hold Focus',
  startColors: ['#86EFAC', '#4ADE80', '#16A34A'] as const,
  gameTitle: '🎯 Focus Field',
  roundLabel: 'FOCUS',
  scoreLabel: 'HITS',
  phaseLabel: 'LOCKED',
};
