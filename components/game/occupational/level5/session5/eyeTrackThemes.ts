import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/shared/Session2UI';

export type EyeTrackBackdropId = 'reader' | 'elevator' | 'orbit' | 'teleport' | 'dual';

export type EyeTrackCopy = {
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
  backdrop: EyeTrackBackdropId;
};

export type EyeTrackThemeBundle = {
  theme: Session2ThemeTokens;
  copy: EyeTrackCopy;
};

export const SIDE_EYE_THEME: Session2ThemeTokens = {
  sky: ['#0F172A', '#1E3A5F', '#1E40AF', '#312E81'],
  title: '#BFDBFE',
  subtitle: '#93C5FD',
  accent: '#38BDF8',
  accentDark: '#0284C7',
  hudGlass: 'rgba(15,23,42,0.85)',
  hudBorder: 'rgba(56,189,248,0.35)',
  cue: '#E0F2FE',
};

export const SIDE_EYE_COPY: EyeTrackCopy = {
  gameTitle: 'Reading Rail',
  emoji: '👁️',
  tagline: 'Side Track · Reading Readiness',
  introBody: 'A glowing dot glides left and right along the reading rail. Follow it smoothly with your eyes — no head turning!',
  chips: ['👀 Eyes', '↔️ Track', '📖 Read'],
  startLabel: 'Begin Tracking',
  startGradient: ['#38BDF8', '#0284C7', '#0369A1'],
  congrats: 'Eye Explorer!',
  scoreLabel: 'ROUNDS',
  rootBg: '#0F172A',
  backdrop: 'reader',
};

export const UP_DOWN_THEME: Session2ThemeTokens = {
  sky: ['#134E4A', '#0F766E', '#14B8A6', '#2DD4BF'],
  title: '#CCFBF1',
  subtitle: '#99F6E4',
  accent: '#2DD4BF',
  accentDark: '#0D9488',
  hudGlass: 'rgba(19,78,74,0.85)',
  hudBorder: 'rgba(45,212,191,0.35)',
  cue: '#F0FDFA',
};

export const UP_DOWN_COPY: EyeTrackCopy = {
  gameTitle: 'Sky Lift',
  emoji: '⬆️',
  tagline: 'Vertical Track · Line Shifting',
  introBody: 'The dot rides the sky lift up and down. Keep your eyes locked on it as it shifts between top and bottom!',
  chips: ['👀 Eyes', '↕️ Shift', '🛗 Lift'],
  startLabel: 'Ride the Lift',
  startGradient: ['#2DD4BF', '#14B8A6', '#0D9488'],
  congrats: 'Lift Master!',
  scoreLabel: 'ROUNDS',
  rootBg: '#134E4A',
  backdrop: 'elevator',
};

export const CIRCULAR_THEME: Session2ThemeTokens = {
  sky: ['#1E1B4B', '#312E81', '#4C1D95', '#6B21A8'],
  title: '#E9D5FF',
  subtitle: '#C4B5FD',
  accent: '#A78BFA',
  accentDark: '#8B5CF6',
  hudGlass: 'rgba(30,27,75,0.85)',
  hudBorder: 'rgba(167,139,250,0.4)',
  cue: '#EDE9FE',
};

export const CIRCULAR_COPY: EyeTrackCopy = {
  gameTitle: 'Orbit Eye',
  emoji: '⭕',
  tagline: 'Circular Path · Smooth Pursuit',
  introBody: 'A planet dot orbits the cosmic ring. Trace the circle with your eyes to strengthen smooth pursuit!',
  chips: ['🪐 Orbit', '👀 Circle', '✨ Smooth'],
  startLabel: 'Launch Orbit',
  startGradient: ['#A78BFA', '#8B5CF6', '#7C3AED'],
  congrats: 'Orbit Champion!',
  scoreLabel: 'ROUNDS',
  rootBg: '#312E81',
  backdrop: 'orbit',
};

export const JUMP_THEME: Session2ThemeTokens = {
  sky: ['#422006', '#713F12', '#A16207', '#CA8A04'],
  title: '#FEF9C3',
  subtitle: '#FDE047',
  accent: '#FACC15',
  accentDark: '#EAB308',
  hudGlass: 'rgba(66,32,6,0.85)',
  hudBorder: 'rgba(250,204,21,0.35)',
  cue: '#FEF3C7',
};

export const JUMP_COPY: EyeTrackCopy = {
  gameTitle: 'Lightning Jump',
  emoji: '⚡',
  tagline: 'Saccade Track · Visual Jumps',
  introBody: 'The dot teleports from node to node like lightning! Snap your eyes to each new spot as fast as you can.',
  chips: ['⚡ Jump', '👀 Snap', '🎯 Spot'],
  startLabel: 'Charge Up',
  startGradient: ['#FACC15', '#EAB308', '#CA8A04'],
  congrats: 'Lightning Eyes!',
  scoreLabel: 'ROUNDS',
  rootBg: '#713F12',
  backdrop: 'teleport',
};

export const MULTI_DOT_THEME: Session2ThemeTokens = {
  sky: ['#1F2937', '#374151', '#4B5563', '#6B7280'],
  title: '#F9FAFB',
  subtitle: '#D1D5DB',
  accent: '#F472B6',
  accentDark: '#EC4899',
  hudGlass: 'rgba(31,41,55,0.88)',
  hudBorder: 'rgba(244,114,182,0.35)',
  cue: '#FBCFE8',
};

export const MULTI_DOT_COPY: EyeTrackCopy = {
  gameTitle: 'Dual Focus',
  emoji: '⚫',
  tagline: 'Alternating Dots · Focus Switch',
  introBody: 'Two dots take turns moving on the dual stage. Switch your eye focus to whichever dot is active!',
  chips: ['🔵 Blue', '🟠 Orange', '🔀 Switch'],
  startLabel: 'Dual Start',
  startGradient: ['#F472B6', '#EC4899', '#DB2777'],
  congrats: 'Focus Switch Pro!',
  scoreLabel: 'ROUNDS',
  rootBg: '#1F2937',
  backdrop: 'dual',
};

export const EYE_TRACK_THEMES: Record<string, EyeTrackThemeBundle> = {
  'side-eye-track': { theme: SIDE_EYE_THEME, copy: SIDE_EYE_COPY },
  'up-down-track': { theme: UP_DOWN_THEME, copy: UP_DOWN_COPY },
  'circular-track': { theme: CIRCULAR_THEME, copy: CIRCULAR_COPY },
  'jump-track': { theme: JUMP_THEME, copy: JUMP_COPY },
  'multi-dot': { theme: MULTI_DOT_THEME, copy: MULTI_DOT_COPY },
};

export function getEyeTrackTheme(logType: string): EyeTrackThemeBundle {
  return EYE_TRACK_THEMES[logType] ?? EYE_TRACK_THEMES['side-eye-track']!;
}
