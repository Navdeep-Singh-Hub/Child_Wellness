import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/shared/Session2UI';

export type GauntletBackdropId = 'comet' | 'fortress' | 'canyon' | 'storm' | 'crown';

export type GauntletCopy = {
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
  backdrop: GauntletBackdropId;
};

export type GauntletThemeBundle = { theme: Session2ThemeTokens; copy: GauntletCopy };

export const PURSUIT_THEME: Session2ThemeTokens = {
  sky: ['#1E1B4B', '#312E81', '#4338CA', '#6366F1'],
  title: '#E0E7FF', subtitle: '#C7D2FE', accent: '#818CF8', accentDark: '#6366F1',
  hudGlass: 'rgba(30,27,75,0.9)', hudBorder: 'rgba(129,140,248,0.4)', cue: '#EEF2FF',
};

export const PURSUIT_COPY: GauntletCopy = {
  gameTitle: 'Comet Chase', emoji: '☄️', tagline: 'Pursuit Relay · Track + Reflex',
  introBody: 'Alternate between chasing a moving comet and snagging lightning flashes. Two visual skills, one mission!',
  chips: ['☄️ Chase', '💡 Flash', '🔗 Combo'], startLabel: 'Launch Chase', startGradient: ['#818CF8', '#6366F1', '#4F46E5'],
  congrats: 'Comet Captain!', scoreLabel: 'HITS', rootBg: '#1E1B4B', backdrop: 'comet',
};

export const FOCUS_THEME: Session2ThemeTokens = {
  sky: ['#134E4A', '#115E59', '#0F766E', '#14B8A6'],
  title: '#CCFBF1', subtitle: '#99F6E4', accent: '#2DD4BF', accentDark: '#14B8A6',
  hudGlass: 'rgba(19,78,74,0.88)', hudBorder: 'rgba(45,212,191,0.35)', cue: '#F0FDFA',
};

export const FOCUS_COPY: GauntletCopy = {
  gameTitle: 'Focus Fortress', emoji: '🏰', tagline: 'Attention Relay · Filter + Control',
  introBody: 'Find the real target among decoys, then master GO and STOP signals. Train focus and impulse control together!',
  chips: ['🎯 Target', '🚦 Signal', '🧠 Focus'], startLabel: 'Enter Fortress', startGradient: ['#2DD4BF', '#14B8A6', '#0D9488'],
  congrats: 'Fortress Guardian!', scoreLabel: 'CLEARS', rootBg: '#134E4A', backdrop: 'fortress',
};

export const DEPTH_THEME: Session2ThemeTokens = {
  sky: ['#431407', '#7C2D12', '#9A3412', '#EA580C'],
  title: '#FFEDD5', subtitle: '#FED7AA', accent: '#FB923C', accentDark: '#F97316',
  hudGlass: 'rgba(67,20,7,0.88)', hudBorder: 'rgba(251,146,60,0.4)', cue: '#FFF7ED',
};

export const DEPTH_COPY: GauntletCopy = {
  gameTitle: 'Canyon Rally', emoji: '🏜️', tagline: 'Depth Relay · Near/Far + Pursuit',
  introBody: 'Tap near or far targets by size, then chase a moving orb across the canyon. Distance and pursuit in one run!',
  chips: ['🔭 Depth', '☄️ Chase', '👆 Tap'], startLabel: 'Start Rally', startGradient: ['#FB923C', '#F97316', '#EA580C'],
  congrats: 'Canyon Champion!', scoreLabel: 'HITS', rootBg: '#431407', backdrop: 'canyon',
};

export const REACTION_THEME: Session2ThemeTokens = {
  sky: ['#500724', '#831843', '#9D174D', '#DB2777'],
  title: '#FCE7F3', subtitle: '#FBCFE8', accent: '#F472B6', accentDark: '#EC4899',
  hudGlass: 'rgba(80,7,36,0.88)', hudBorder: 'rgba(244,114,182,0.4)', cue: '#FDF2F8',
};

export const REACTION_COPY: GauntletCopy = {
  gameTitle: 'Storm Relay', emoji: '🌩️', tagline: 'Reaction Relay · Flash + Speed',
  introBody: 'Lightning flashes, traffic signals, and speed-matching movers rotate each round. Stay sharp through the storm!',
  chips: ['💡 Flash', '🚦 Stop', '⚡ Speed'], startLabel: 'Ride Storm', startGradient: ['#F472B6', '#EC4899', '#DB2777'],
  congrats: 'Storm Rider!', scoreLabel: 'HITS', rootBg: '#500724', backdrop: 'storm',
};

export const EAGLE_THEME: Session2ThemeTokens = {
  sky: ['#422006', '#713F12', '#A16207', '#EAB308'],
  title: '#FEF9C3', subtitle: '#FDE68A', accent: '#FACC15', accentDark: '#EAB308',
  hudGlass: 'rgba(66,32,6,0.9)', hudBorder: 'rgba(250,204,21,0.45)', cue: '#FFFBEB',
};

export const EAGLE_COPY: GauntletCopy = {
  gameTitle: 'Eagle Eye Quest', emoji: '🦅', tagline: 'Grand Finale · All Visual Skills',
  introBody: 'The ultimate visual challenge! Every round throws a new skill from Level 5 — chase, flash, focus, depth, speed and control.',
  chips: ['🦅 Eagle', '🎯 Mixed', '🏆 Finale'], startLabel: 'Begin Quest', startGradient: ['#FACC15', '#EAB308', '#CA8A04'],
  congrats: 'Eagle Eye Legend!', scoreLabel: 'QUEST', rootBg: '#422006', backdrop: 'crown',
};

export const GAUNTLET_THEMES: Record<string, GauntletThemeBundle> = {
  'pursuit-combo': { theme: PURSUIT_THEME, copy: PURSUIT_COPY },
  'focus-relay': { theme: FOCUS_THEME, copy: FOCUS_COPY },
  'depth-mix': { theme: DEPTH_THEME, copy: DEPTH_COPY },
  'reaction-relay': { theme: REACTION_THEME, copy: REACTION_COPY },
  'eagle-eye-quest': { theme: EAGLE_THEME, copy: EAGLE_COPY },
};

export function getGauntletTheme(logType: string): GauntletThemeBundle {
  return GAUNTLET_THEMES[logType] ?? GAUNTLET_THEMES['eagle-eye-quest']!;
}

export const CHALLENGE_HINTS: Record<string, string> = {
  movingTap: 'Tap the moving orb!',
  flashTap: 'Tap the flash fast!',
  goStop: 'Green tap — red hold back!',
  distractTap: 'Tap the starred target!',
  nearFar: 'Tap near or far as called!',
  speedMatch: 'Match the called speed!',
};

export const CHALLENGE_TTS: Record<string, string> = {
  movingTap: 'Chase and tap!',
  flashTap: 'Flash tap!',
  goStop: 'Go or stop!',
  distractTap: 'Find the target!',
  nearFar: 'Near or far!',
  speedMatch: 'Match the speed!',
};
