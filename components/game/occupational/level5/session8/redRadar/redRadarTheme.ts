import type { TrackCopy, TrackThemeTokens } from '@/components/game/occupational/level5/session8/trackTheme';

export const RED_RADAR_THEME: TrackThemeTokens = {
  sky: ['#450A0A', '#7F1D1D', '#991B1B', '#B91C1C'],
  hudGlass: 'rgba(69,10,10,0.9)',
  hudBorder: 'rgba(248,113,113,0.4)',
  title: '#FECACA',
  subtitle: '#FCA5A5',
  accent: '#F87171',
  accentDark: '#EF4444',
};

export const RED_RADAR_COPY: TrackCopy = {
  title: 'Red Radar',
  emoji: '🔴',
  subtitle: 'Color Track · Selective Attention',
  introDescription: 'Five objects drift across the radar screen. Lock onto the red one and tap it — ignore all other colors!',
  ttsComplete: 'Incredible! You hunted every red target on radar!',
  congratsMessage: 'Red Hunter!',
};

export const RED_RADAR_META = {
  rootBg: '#450A0A',
  chips: ['🔴 Red', '👀 Track', '👆 Tap'] as const,
  startLabel: '🔴 Scan Radar',
  startColors: ['#FCA5A5', '#F87171', '#DC2626'] as const,
  gameTitle: '🔴 Red Radar',
  roundLabel: 'SCAN',
  scoreLabel: 'CATCHES',
  phaseLabel: 'TRACKING',
};
