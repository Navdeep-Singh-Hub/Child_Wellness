import type { TrackCopy, TrackThemeTokens } from '@/components/game/occupational/level5/session8/trackTheme';

export const SPEED_STORM_THEME: TrackThemeTokens = {
  sky: ['#78350F', '#92400E', '#B45309', '#D97706'],
  hudGlass: 'rgba(66,32,6,0.9)',
  hudBorder: 'rgba(251,191,36,0.4)',
  title: '#FEF3C7',
  subtitle: '#FDE68A',
  accent: '#FBBF24',
  accentDark: '#F59E0B',
};

export const SPEED_STORM_COPY: TrackCopy = {
  title: 'Speed Storm',
  emoji: '⚡',
  subtitle: 'Velocity Track · Speed Discrimination',
  introDescription: 'Fast and slow objects swirl in the storm. Each round, tap an object matching the called speed!',
  ttsComplete: 'Storm conquered! You matched every speed call!',
  congratsMessage: 'Storm Tracker!',
};

export const SPEED_STORM_META = {
  rootBg: '#78350F',
  chips: ['⚡ Fast', '🐢 Slow', '👆 Match'] as const,
  startLabel: '⚡ Ride Storm',
  startColors: ['#FDE68A', '#FBBF24', '#D97706'] as const,
  gameTitle: '⚡ Speed Storm',
  roundLabel: 'STORM',
  scoreLabel: 'HITS',
  phaseLabel: 'SWIRL',
};
