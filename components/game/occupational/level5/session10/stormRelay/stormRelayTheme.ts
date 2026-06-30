import type { GauntletConfig, GauntletCopy } from '@/components/game/occupational/level5/session10/gauntletTheme';
import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/session2Theme';

export const STORM_RELAY_THEME: Session2ThemeTokens = {
  sky: ['#500724', '#831843', '#9D174D', '#DB2777'],
  title: '#FCE7F3',
  subtitle: '#FBCFE8',
  accent: '#F472B6',
  accentDark: '#EC4899',
  hudGlass: 'rgba(80,7,36,0.88)',
  hudBorder: 'rgba(244,114,182,0.4)',
  cue: '#FDF2F8',
};

export const STORM_RELAY_COPY: GauntletCopy = {
  gameTitle: 'Storm Relay',
  emoji: '🌩️',
  tagline: 'Reaction Relay · Flash + Speed',
  introBody:
    'Lightning flashes, traffic signals, and speed-matching movers rotate each round. Stay sharp through the storm!',
  chips: ['💡 Flash', '🚦 Stop', '⚡ Speed'],
  startLabel: 'Ride Storm',
  startGradient: ['#F472B6', '#EC4899', '#DB2777'],
  congrats: 'Storm Rider!',
  scoreLabel: 'HITS',
  rootBg: '#500724',
  backdrop: 'storm',
};

export const STORM_RELAY_CONFIG: GauntletConfig = {
  logType: 'reaction-relay',
  skillTags: ['visual-integration', 'reaction-time', 'speed-discrimination'],
  challenges: ['flashTap', 'goStop', 'speedMatch'],
};

/** @deprecated use STORM_RELAY_THEME */
export const REACTION_THEME = STORM_RELAY_THEME;
/** @deprecated use STORM_RELAY_COPY */
export const REACTION_COPY = STORM_RELAY_COPY;
/** @deprecated use STORM_RELAY_CONFIG */
export const REACTION_RELAY_CONFIG = STORM_RELAY_CONFIG;
