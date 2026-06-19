import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/shared/Session2UI';

export type DepthBackdropId = 'horizon' | 'lens' | 'orchard' | 'shrink' | 'stack';

export type DepthCopy = {
  gameTitle: string;
  emoji: string;
  tagline: string;
  introBody: string;
  chips: string[];
  startLabel: string;
  startGradient: readonly string[];
  congrats: string;
  scoreLabel: string;
  rootBg: string;
  backdrop: DepthBackdropId;
};

export type DepthThemeBundle = {
  theme: Session2ThemeTokens;
  copy: DepthCopy;
};

export const NEAR_FAR_THEME: Session2ThemeTokens = {
  sky: ['#0C4A6E', '#0369A1', '#0284C7', '#38BDF8'],
  title: '#E0F2FE',
  subtitle: '#BAE6FD',
  accent: '#38BDF8',
  accentDark: '#0284C7',
  hudGlass: 'rgba(12,74,110,0.88)',
  hudBorder: 'rgba(56,189,248,0.35)',
  cue: '#F0F9FF',
};

export const NEAR_FAR_COPY: DepthCopy = {
  gameTitle: 'Distance Dash',
  emoji: '📏',
  tagline: 'Horizon Path · Near vs Far',
  introBody: 'Stand at the yellow viewpoint. Judge which object is closer or farther along the depth path!',
  chips: ['📍 You', '↔️ Near', '🔭 Far'],
  startLabel: 'Start Judging',
  startGradient: ['#38BDF8', '#0284C7', '#0369A1'],
  congrats: 'Distance Expert!',
  scoreLabel: 'ROUNDS',
  rootBg: '#0C4A6E',
  backdrop: 'horizon',
};

export const ZOOM_THEME: Session2ThemeTokens = {
  sky: ['#831843', '#9D174D', '#BE185D', '#EC4899'],
  title: '#FCE7F3',
  subtitle: '#FBCFE8',
  accent: '#F472B6',
  accentDark: '#EC4899',
  hudGlass: 'rgba(131,24,67,0.88)',
  hudBorder: 'rgba(244,114,182,0.4)',
  cue: '#FDF2F8',
};

export const ZOOM_COPY: DepthCopy = {
  gameTitle: 'Zoom Lens',
  emoji: '🔍',
  tagline: 'Magnifier Lab · Depth Scaling',
  introBody: 'Watch the object grow through the zoom lens. Tap when it feels close and big enough!',
  chips: ['🔍 Zoom', '📐 Size', '👆 Tap'],
  startLabel: 'Focus Lens',
  startGradient: ['#F472B6', '#EC4899', '#DB2777'],
  congrats: 'Zoom Master!',
  scoreLabel: 'HITS',
  rootBg: '#831843',
  backdrop: 'lens',
};

export const FALLING_THEME: Session2ThemeTokens = {
  sky: ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD'],
  title: '#DBEAFE',
  subtitle: '#BFDBFE',
  accent: '#FB923C',
  accentDark: '#F97316',
  hudGlass: 'rgba(30,58,138,0.85)',
  hudBorder: 'rgba(251,146,60,0.4)',
  cue: '#FFEDD5',
};

export const FALLING_COPY: DepthCopy = {
  gameTitle: 'Apple Drop',
  emoji: '🍎',
  tagline: 'Orchard Sky · Prediction',
  introBody: 'Apples tumble from the orchard sky. Intercept each one before it hits the ground!',
  chips: ['🍎 Catch', '⬇️ Fall', '⚡ React'],
  startLabel: 'Catch Fruit',
  startGradient: ['#FB923C', '#F97316', '#EA580C'],
  congrats: 'Orchard Hero!',
  scoreLabel: 'CATCHES',
  rootBg: '#1E3A8A',
  backdrop: 'orchard',
};

export const SHRINK_THEME: Session2ThemeTokens = {
  sky: ['#450A0A', '#7F1D1D', '#991B1B', '#DC2626'],
  title: '#FECACA',
  subtitle: '#FCA5A5',
  accent: '#F87171',
  accentDark: '#EF4444',
  hudGlass: 'rgba(69,10,10,0.88)',
  hudBorder: 'rgba(248,113,113,0.4)',
  cue: '#FEE2E2',
};

export const SHRINK_COPY: DepthCopy = {
  gameTitle: 'Shrink Zone',
  emoji: '🎯',
  tagline: 'Precision Portal · Timing',
  introBody: 'The target shrinks into the distance portal. Tap it before it vanishes completely!',
  chips: ['🎯 Aim', '📉 Shrink', '⚡ Quick'],
  startLabel: 'Enter Zone',
  startGradient: ['#F87171', '#EF4444', '#DC2626'],
  congrats: 'Precision Pro!',
  scoreLabel: 'HITS',
  rootBg: '#450A0A',
  backdrop: 'shrink',
};

export const LAYERS_THEME: Session2ThemeTokens = {
  sky: ['#312E81', '#4338CA', '#6366F1', '#818CF8'],
  title: '#E0E7FF',
  subtitle: '#C7D2FE',
  accent: '#A78BFA',
  accentDark: '#8B5CF6',
  hudGlass: 'rgba(49,46,129,0.88)',
  hudBorder: 'rgba(167,139,250,0.4)',
  cue: '#EDE9FE',
};

export const LAYERS_COPY: DepthCopy = {
  gameTitle: 'Layer Stack',
  emoji: '📚',
  tagline: 'Depth Layers · Foreground Pick',
  introBody: 'Three colorful discs overlap in 3D space. Tap only the one in front — the top layer!',
  chips: ['📚 Layers', '👆 Front', '🎯 Pick'],
  startLabel: 'Stack Up',
  startGradient: ['#A78BFA', '#8B5CF6', '#7C3AED'],
  congrats: 'Layer Legend!',
  scoreLabel: 'ROUNDS',
  rootBg: '#312E81',
  backdrop: 'stack',
};

export const DEPTH_THEMES: Record<string, DepthThemeBundle> = {
  'near-vs-far': { theme: NEAR_FAR_THEME, copy: NEAR_FAR_COPY },
  'zoom-touch': { theme: ZOOM_THEME, copy: ZOOM_COPY },
  'falling-objects': { theme: FALLING_THEME, copy: FALLING_COPY },
  'depth-shrinking-target': { theme: SHRINK_THEME, copy: SHRINK_COPY },
  '3-layer-tap': { theme: LAYERS_THEME, copy: LAYERS_COPY },
};

export function getDepthTheme(logType: string): DepthThemeBundle {
  return DEPTH_THEMES[logType] ?? DEPTH_THEMES['near-vs-far']!;
}
