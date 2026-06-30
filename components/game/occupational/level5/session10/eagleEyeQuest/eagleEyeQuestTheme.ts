import type { GauntletConfig, GauntletCopy } from '@/components/game/occupational/level5/session10/gauntletTheme';
import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/session2Theme';

export const EAGLE_EYE_QUEST_THEME: Session2ThemeTokens = {
  sky: ['#422006', '#713F12', '#A16207', '#EAB308'],
  title: '#FEF9C3',
  subtitle: '#FDE68A',
  accent: '#FACC15',
  accentDark: '#EAB308',
  hudGlass: 'rgba(66,32,6,0.9)',
  hudBorder: 'rgba(250,204,21,0.45)',
  cue: '#FFFBEB',
};

export const EAGLE_EYE_QUEST_COPY: GauntletCopy = {
  gameTitle: 'Eagle Eye Quest',
  emoji: '🦅',
  tagline: 'Grand Finale · All Visual Skills',
  introBody:
    'The ultimate visual challenge! Every round throws a new skill from Level 5 — chase, flash, focus, depth, speed and control.',
  chips: ['🦅 Eagle', '🎯 Mixed', '🏆 Finale'],
  startLabel: 'Begin Quest',
  startGradient: ['#FACC15', '#EAB308', '#CA8A04'],
  congrats: 'Eagle Eye Legend!',
  scoreLabel: 'QUEST',
  rootBg: '#422006',
  backdrop: 'crown',
};

export const EAGLE_EYE_QUEST_CONFIG: GauntletConfig = {
  logType: 'eagle-eye-quest',
  skillTags: ['visual-integration', 'multi-skill', 'visual-motor'],
  challenges: ['movingTap', 'flashTap', 'goStop', 'distractTap', 'nearFar', 'speedMatch'],
  randomPool: true,
};

/** @deprecated use EAGLE_EYE_QUEST_THEME */
export const EAGLE_THEME = EAGLE_EYE_QUEST_THEME;
/** @deprecated use EAGLE_EYE_QUEST_COPY */
export const EAGLE_COPY = EAGLE_EYE_QUEST_COPY;
/** @deprecated use EAGLE_EYE_QUEST_CONFIG */
export const EAGLE_EYE_CONFIG = EAGLE_EYE_QUEST_CONFIG;
