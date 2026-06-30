/** Design tokens — Session 7 · Game 3 · Apple Drop */
import type { DepthCopy, DepthGameMeta, DepthThemeTokens } from '@/components/game/occupational/level5/session7/depthTheme';

export const APPLE_DROP_THEME = {
  sky: ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD'] as const,
  ground: 'rgba(34,197,94,0.3)',
  groundLine: 'rgba(255,255,255,0.25)',
  hudGlass: 'rgba(30,58,138,0.9)',
  hudBorder: 'rgba(251,146,60,0.4)',
  title: '#DBEAFE',
  subtitle: '#BFDBFE',
  accent: '#FB923C',
  accentDark: '#F97316',
} as const satisfies DepthThemeTokens & { ground: string; groundLine: string };

export const APPLE_DROP_COPY: DepthCopy = {
  title: 'Apple Drop',
  emoji: '🍎',
  subtitle: 'Orchard Sky · Prediction',
  introDescription: 'Apples tumble from the orchard sky. Intercept each one before it hits the ground!',
  ttsComplete: 'Wonderful! Your prediction skills are orchard-ready!',
  congratsMessage: 'Orchard Hero!',
  logType: 'falling-objects',
};

export const APPLE_DROP_META: DepthGameMeta = {
  rootBg: '#1E3A8A',
  chips: ['🍎 Catch', '⬇️ Fall', '⚡ React'],
  startLabel: '🍎 Catch Fruit',
  startColors: ['#FDBA74', '#FB923C', '#EA580C'],
  gameTitle: '🍎 Apple Drop',
  roundLabel: 'DROP',
  scoreLabel: 'CATCHES',
  phaseLabel: 'FALLING',
};
