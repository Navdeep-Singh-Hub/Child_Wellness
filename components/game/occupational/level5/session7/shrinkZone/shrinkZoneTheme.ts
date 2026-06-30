/** Design tokens — Session 7 · Game 4 · Shrink Zone */
import type { DepthCopy, DepthGameMeta, DepthThemeTokens } from '@/components/game/occupational/level5/session7/depthTheme';

export const SHRINK_ZONE_THEME = {
  sky: ['#450A0A', '#7F1D1D', '#991B1B', '#DC2626'] as const,
  portal: 'rgba(248,113,113,0.45)',
  portalCore: 'rgba(248,113,113,0.2)',
  hudGlass: 'rgba(69,10,10,0.9)',
  hudBorder: 'rgba(248,113,113,0.4)',
  title: '#FECACA',
  subtitle: '#FCA5A5',
  accent: '#F87171',
  accentDark: '#EF4444',
} as const satisfies DepthThemeTokens & { portal: string; portalCore: string };

export const SHRINK_ZONE_COPY: DepthCopy = {
  title: 'Shrink Zone',
  emoji: '🎯',
  subtitle: 'Precision Portal · Timing',
  introDescription: 'The target shrinks into the distance portal. Tap it before it vanishes completely!',
  ttsComplete: 'Precision perfect! You beat the shrink zone!',
  congratsMessage: 'Precision Pro!',
  logType: 'depth-shrinking-target',
};

export const SHRINK_ZONE_META: DepthGameMeta = {
  rootBg: '#450A0A',
  chips: ['🎯 Aim', '📉 Shrink', '⚡ Quick'],
  startLabel: '🎯 Enter Zone',
  startColors: ['#FCA5A5', '#F87171', '#DC2626'],
  gameTitle: '🎯 Shrink Zone',
  roundLabel: 'ZONE',
  scoreLabel: 'HITS',
  phaseLabel: 'SHRINKING',
};
