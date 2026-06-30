import type { GauntletConfig, GauntletCopy } from '@/components/game/occupational/level5/session10/gauntletTheme';
import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/session2Theme';

export const FOCUS_FORTRESS_THEME: Session2ThemeTokens = {
  sky: ['#134E4A', '#115E59', '#0F766E', '#14B8A6'],
  title: '#CCFBF1',
  subtitle: '#99F6E4',
  accent: '#2DD4BF',
  accentDark: '#14B8A6',
  hudGlass: 'rgba(19,78,74,0.88)',
  hudBorder: 'rgba(45,212,191,0.35)',
  cue: '#F0FDFA',
};

export const FOCUS_FORTRESS_COPY: GauntletCopy = {
  gameTitle: 'Focus Fortress',
  emoji: '🏰',
  tagline: 'Attention Relay · Filter + Control',
  introBody:
    'Find the real target among decoys, then master GO and STOP signals. Train focus and impulse control together!',
  chips: ['🎯 Target', '🚦 Signal', '🧠 Focus'],
  startLabel: 'Enter Fortress',
  startGradient: ['#2DD4BF', '#14B8A6', '#0D9488'],
  congrats: 'Fortress Guardian!',
  scoreLabel: 'CLEARS',
  rootBg: '#134E4A',
  backdrop: 'fortress',
};

export const FOCUS_FORTRESS_CONFIG: GauntletConfig = {
  logType: 'focus-relay',
  skillTags: ['visual-integration', 'selective-attention', 'inhibition'],
  challenges: ['distractTap', 'goStop'],
};

/** @deprecated use FOCUS_FORTRESS_THEME */
export const FOCUS_THEME = FOCUS_FORTRESS_THEME;
/** @deprecated use FOCUS_FORTRESS_COPY */
export const FOCUS_COPY = FOCUS_FORTRESS_COPY;
/** @deprecated use FOCUS_FORTRESS_CONFIG */
export const FOCUS_RELAY_CONFIG = FOCUS_FORTRESS_CONFIG;
