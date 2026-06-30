/** Design tokens — Session 7 · Game 1 · Distance Dash */
import type { DepthCopy, DepthGameMeta, DepthThemeTokens } from '@/components/game/occupational/level5/session7/depthTheme';

export const DISTANCE_DASH_THEME = {
  sky: ['#0C4A6E', '#0369A1', '#0284C7', '#38BDF8'] as const,
  road: 'rgba(56,189,248,0.35)',
  horizon: 'rgba(56,189,248,0.55)',
  vanish: 'rgba(56,189,248,0.2)',
  hudGlass: 'rgba(12,74,110,0.9)',
  hudBorder: 'rgba(56,189,248,0.4)',
  title: '#E0F2FE',
  subtitle: '#BAE6FD',
  accent: '#38BDF8',
  accentDark: '#0284C7',
} as const satisfies DepthThemeTokens & { road: string; horizon: string; vanish: string };

export const DISTANCE_DASH_COPY: DepthCopy = {
  title: 'Distance Dash',
  emoji: '📏',
  subtitle: 'Horizon Path · Near vs Far',
  introDescription: 'Stand at the yellow viewpoint. Judge which object is closer or farther along the depth path!',
  ttsComplete: 'Excellent! You mastered distance judgment!',
  congratsMessage: 'Distance Expert!',
  logType: 'near-vs-far',
};

export const DISTANCE_DASH_META: DepthGameMeta = {
  rootBg: '#0C4A6E',
  chips: ['📍 You', '↔️ Near', '🔭 Far'],
  startLabel: '📏 Start Judging',
  startColors: ['#7DD3FC', '#38BDF8', '#0284C7'],
  gameTitle: '📏 Distance Dash',
  roundLabel: 'JUDGE',
  scoreLabel: 'ROUNDS',
  phaseLabel: 'JUDGING',
};
