/** Design tokens — Session 7 · Game 5 · Layer Stack */
import type { DepthCopy, DepthGameMeta, DepthThemeTokens } from '@/components/game/occupational/level5/session7/depthTheme';

export const LAYER_STACK_THEME = {
  sky: ['#312E81', '#4338CA', '#6366F1', '#818CF8'] as const,
  stackBack: 'rgba(167,139,250,0.2)',
  stackMid: 'rgba(167,139,250,0.3)',
  stackFront: 'rgba(167,139,250,0.4)',
  hudGlass: 'rgba(49,46,129,0.9)',
  hudBorder: 'rgba(167,139,250,0.4)',
  title: '#E0E7FF',
  subtitle: '#C7D2FE',
  accent: '#A78BFA',
  accentDark: '#8B5CF6',
} as const satisfies DepthThemeTokens & { stackBack: string; stackMid: string; stackFront: string };

export const LAYER_STACK_COPY: DepthCopy = {
  title: 'Layer Stack',
  emoji: '📚',
  subtitle: 'Depth Layers · Foreground Pick',
  introDescription: 'Three colorful discs overlap in 3D space. Tap only the one in front — the top layer!',
  ttsComplete: 'Amazing! You mastered visual layering!',
  congratsMessage: 'Layer Legend!',
  logType: '3-layer-tap',
};

export const LAYER_STACK_META: DepthGameMeta = {
  rootBg: '#312E81',
  chips: ['📚 Layers', '👆 Front', '🎯 Pick'],
  startLabel: '📚 Stack Up',
  startColors: ['#C4B5FD', '#A78BFA', '#7C3AED'],
  gameTitle: '📚 Layer Stack',
  roundLabel: 'LAYER',
  scoreLabel: 'ROUNDS',
  phaseLabel: 'PICKING',
};
