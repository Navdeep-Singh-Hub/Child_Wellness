import type { GauntletConfig, GauntletCopy } from '@/components/game/occupational/level5/session10/gauntletTheme';
import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/session2Theme';

export const COMET_CHASE_THEME: Session2ThemeTokens = {
  sky: ['#1E1B4B', '#312E81', '#4338CA', '#6366F1'],
  title: '#E0E7FF',
  subtitle: '#C7D2FE',
  accent: '#818CF8',
  accentDark: '#6366F1',
  hudGlass: 'rgba(30,27,75,0.9)',
  hudBorder: 'rgba(129,140,248,0.4)',
  cue: '#EEF2FF',
};

export const COMET_CHASE_COPY: GauntletCopy = {
  gameTitle: 'Comet Chase',
  emoji: '☄️',
  tagline: 'Pursuit Relay · Track + Reflex',
  introBody:
    'Alternate between chasing a moving comet and snagging lightning flashes. Two visual skills, one mission!',
  chips: ['☄️ Chase', '💡 Flash', '🔗 Combo'],
  startLabel: 'Launch Chase',
  startGradient: ['#818CF8', '#6366F1', '#4F46E5'],
  congrats: 'Comet Captain!',
  scoreLabel: 'HITS',
  rootBg: '#1E1B4B',
  backdrop: 'comet',
};

export const COMET_CHASE_CONFIG: GauntletConfig = {
  logType: 'pursuit-combo',
  skillTags: ['visual-integration', 'pursuit', 'reflex'],
  challenges: ['movingTap', 'flashTap'],
};

/** @deprecated use COMET_CHASE_THEME */
export const PURSUIT_THEME = COMET_CHASE_THEME;
/** @deprecated use COMET_CHASE_COPY */
export const PURSUIT_COPY = COMET_CHASE_COPY;
/** @deprecated use COMET_CHASE_CONFIG */
export const PURSUIT_COMBO_CONFIG = COMET_CHASE_CONFIG;
