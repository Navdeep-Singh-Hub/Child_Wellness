import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/shared/Session2UI';

export type MultiTrackBackdropId = 'radar' | 'duel' | 'storm' | 'focus' | 'sequence';

export type MultiTrackCopy = {
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
  backdrop: MultiTrackBackdropId;
};

export type MultiTrackThemeBundle = { theme: Session2ThemeTokens; copy: MultiTrackCopy };

export const FOLLOW_RED_THEME: Session2ThemeTokens = {
  sky: ['#450A0A', '#7F1D1D', '#991B1B', '#B91C1C'],
  title: '#FECACA', subtitle: '#FCA5A5', accent: '#F87171', accentDark: '#EF4444',
  hudGlass: 'rgba(69,10,10,0.88)', hudBorder: 'rgba(248,113,113,0.35)', cue: '#FEE2E2',
};

export const FOLLOW_RED_COPY: MultiTrackCopy = {
  gameTitle: 'Red Radar', emoji: '🔴', tagline: 'Color Track · Selective Attention',
  introBody: 'Five objects drift across the radar screen. Lock onto the red one and tap it — ignore all other colors!',
  chips: ['🔴 Red', '👀 Track', '👆 Tap'], startLabel: 'Scan Radar', startGradient: ['#F87171', '#EF4444', '#DC2626'],
  congrats: 'Red Hunter!', scoreLabel: 'CATCHES', rootBg: '#450A0A', backdrop: 'radar',
};

export const TWO_BALLS_THEME: Session2ThemeTokens = {
  sky: ['#0C4A6E', '#0369A1', '#0284C7', '#38BDF8'],
  title: '#E0F2FE', subtitle: '#BAE6FD', accent: '#38BDF8', accentDark: '#0284C7',
  hudGlass: 'rgba(12,74,110,0.88)', hudBorder: 'rgba(56,189,248,0.35)', cue: '#F0F9FF',
};

export const TWO_BALLS_COPY: MultiTrackCopy = {
  gameTitle: 'Ball Duel', emoji: '⚽', tagline: 'Twin Track · Object Filter',
  introBody: 'Two balls bounce around the arena. One is marked with a star — track it and tap the correct ball!',
  chips: ['⚽ Track', '⭐ Mark', '👆 Tap'], startLabel: 'Enter Duel', startGradient: ['#38BDF8', '#0284C7', '#0369A1'],
  congrats: 'Duel Champion!', scoreLabel: 'WINS', rootBg: '#0C4A6E', backdrop: 'duel',
};

export const DISTRACTION_THEME: Session2ThemeTokens = {
  sky: ['#14532D', '#166534', '#15803D', '#22C55E'],
  title: '#BBF7D0', subtitle: '#86EFAC', accent: '#4ADE80', accentDark: '#22C55E',
  hudGlass: 'rgba(20,83,45,0.85)', hudBorder: 'rgba(74,222,128,0.35)', cue: '#DCFCE7',
};

export const DISTRACTION_COPY: MultiTrackCopy = {
  gameTitle: 'Focus Field', emoji: '🎯', tagline: 'Distraction Grid · Focus Under Load',
  introBody: 'A bullseye hides among gray decoys. Tap the target and ignore every distraction around it!',
  chips: ['🎯 Target', '🚫 Ignore', '👆 Focus'], startLabel: 'Hold Focus', startGradient: ['#4ADE80', '#22C55E', '#16A34A'],
  congrats: 'Focus Master!', scoreLabel: 'HITS', rootBg: '#14532D', backdrop: 'focus',
};

export const PATTERN_THEME: Session2ThemeTokens = {
  sky: ['#4C1D95', '#6B21A8', '#7E22CE', '#A855F7'],
  title: '#F3E8FF', subtitle: '#E9D5FF', accent: '#C084FC', accentDark: '#A855F7',
  hudGlass: 'rgba(76,29,149,0.88)', hudBorder: 'rgba(192,132,252,0.4)', cue: '#FAE8FF',
};

export const PATTERN_COPY: MultiTrackCopy = {
  gameTitle: 'Sequence Chase', emoji: '🔢', tagline: 'Pattern Stage · Visual Memory',
  introBody: 'Watch the emoji sequence light up, then replay it step by step from memory!',
  chips: ['👁️ Watch', '🔢 Order', '🧠 Recall'], startLabel: 'Begin Sequence', startGradient: ['#C084FC', '#A855F7', '#9333EA'],
  congrats: 'Pattern Pro!', scoreLabel: 'ROUNDS', rootBg: '#4C1D95', backdrop: 'sequence',
};

export const SPEED_OBJECTS_THEME: Session2ThemeTokens = {
  sky: ['#78350F', '#92400E', '#B45309', '#D97706'],
  title: '#FEF3C7', subtitle: '#FDE68A', accent: '#FBBF24', accentDark: '#F59E0B',
  hudGlass: 'rgba(120,53,15,0.88)', hudBorder: 'rgba(251,191,36,0.35)', cue: '#FEF9C3',
};

export const SPEED_OBJECTS_COPY: MultiTrackCopy = {
  gameTitle: 'Speed Storm', emoji: '⚡', tagline: 'Velocity Track · Speed Discrimination',
  introBody: 'Fast and slow objects swirl in the storm. Each round, tap an object matching the called speed!',
  chips: ['⚡ Fast', '🐢 Slow', '👆 Match'], startLabel: 'Ride Storm', startGradient: ['#FBBF24', '#F59E0B', '#D97706'],
  congrats: 'Storm Tracker!', scoreLabel: 'HITS', rootBg: '#78350F', backdrop: 'storm',
};

export const MULTI_TRACK_THEMES: Record<string, MultiTrackThemeBundle> = {
  'follow-red': { theme: FOLLOW_RED_THEME, copy: FOLLOW_RED_COPY },
  'two-moving-balls': { theme: TWO_BALLS_THEME, copy: TWO_BALLS_COPY },
  'distraction-mode': { theme: DISTRACTION_THEME, copy: DISTRACTION_COPY },
  'pattern-chase': { theme: PATTERN_THEME, copy: PATTERN_COPY },
  'speed-objects': { theme: SPEED_OBJECTS_THEME, copy: SPEED_OBJECTS_COPY },
};

export function getMultiTrackTheme(logType: string): MultiTrackThemeBundle {
  return MULTI_TRACK_THEMES[logType] ?? MULTI_TRACK_THEMES['follow-red']!;
}
