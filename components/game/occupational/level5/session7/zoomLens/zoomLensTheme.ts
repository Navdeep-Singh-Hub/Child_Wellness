/** Design tokens — Session 7 · Game 2 · Zoom Lens */
import type { DepthCopy, DepthGameMeta, DepthThemeTokens } from '@/components/game/occupational/level5/session7/depthTheme';

export const ZOOM_LENS_THEME = {
  sky: ['#831843', '#9D174D', '#BE185D', '#EC4899'] as const,
  ring: 'rgba(244,114,182,0.5)',
  cross: 'rgba(244,114,182,0.35)',
  hudGlass: 'rgba(131,24,67,0.9)',
  hudBorder: 'rgba(244,114,182,0.4)',
  title: '#FCE7F3',
  subtitle: '#FBCFE8',
  accent: '#F472B6',
  accentDark: '#EC4899',
} as const satisfies DepthThemeTokens & { ring: string; cross: string };

export const ZOOM_LENS_COPY: DepthCopy = {
  title: 'Zoom Lens',
  emoji: '🔍',
  subtitle: 'Magnifier Lab · Depth Scaling',
  introDescription: 'Watch the object grow through the zoom lens. Tap when it feels close and big enough!',
  ttsComplete: 'Perfect! You nailed depth scaling timing!',
  congratsMessage: 'Zoom Master!',
  logType: 'zoom-touch',
};

export const ZOOM_LENS_META: DepthGameMeta = {
  rootBg: '#831843',
  chips: ['🔍 Zoom', '📐 Size', '👆 Tap'],
  startLabel: '🔍 Focus Lens',
  startColors: ['#F9A8D4', '#F472B6', '#DB2777'],
  gameTitle: '🔍 Zoom Lens',
  roundLabel: 'ZOOM',
  scoreLabel: 'HITS',
  phaseLabel: 'GROWING',
};
