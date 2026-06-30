import type { GauntletConfig, GauntletCopy } from '@/components/game/occupational/level5/session10/gauntletTheme';
import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/session2Theme';

export const CANYON_RALLY_THEME: Session2ThemeTokens = {
  sky: ['#431407', '#7C2D12', '#9A3412', '#EA580C'],
  title: '#FFEDD5',
  subtitle: '#FED7AA',
  accent: '#FB923C',
  accentDark: '#F97316',
  hudGlass: 'rgba(67,20,7,0.88)',
  hudBorder: 'rgba(251,146,60,0.4)',
  cue: '#FFF7ED',
};

export const CANYON_RALLY_COPY: GauntletCopy = {
  gameTitle: 'Canyon Rally',
  emoji: '🏜️',
  tagline: 'Depth Relay · Near/Far + Pursuit',
  introBody:
    'Tap near or far targets by size, then chase a moving orb across the canyon. Distance and pursuit in one run!',
  chips: ['🔭 Depth', '☄️ Chase', '👆 Tap'],
  startLabel: 'Start Rally',
  startGradient: ['#FB923C', '#F97316', '#EA580C'],
  congrats: 'Canyon Champion!',
  scoreLabel: 'HITS',
  rootBg: '#431407',
  backdrop: 'canyon',
};

export const CANYON_RALLY_CONFIG: GauntletConfig = {
  logType: 'depth-mix',
  skillTags: ['visual-integration', 'depth-perception', 'pursuit'],
  challenges: ['nearFar', 'movingTap'],
};

/** @deprecated use CANYON_RALLY_THEME */
export const DEPTH_THEME = CANYON_RALLY_THEME;
/** @deprecated use CANYON_RALLY_COPY */
export const DEPTH_COPY = CANYON_RALLY_COPY;
/** @deprecated use CANYON_RALLY_CONFIG */
export const DEPTH_MIX_CONFIG = CANYON_RALLY_CONFIG;
