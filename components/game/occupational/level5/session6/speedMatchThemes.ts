import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/shared/Session2UI';

export type SpeedMatchBackdropId = 'stadium' | 'meadow' | 'turbo' | 'clock' | 'disco';

export type SpeedMatchCopy = {
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
  backdrop: SpeedMatchBackdropId;
};

export type SpeedMatchThemeBundle = {
  theme: Session2ThemeTokens;
  copy: SpeedMatchCopy;
};

export const FAST_CATCH_THEME: Session2ThemeTokens = {
  sky: ['#450A0A', '#7F1D1D', '#B91C1C', '#DC2626'],
  title: '#FECACA',
  subtitle: '#FCA5A5',
  accent: '#F87171',
  accentDark: '#EF4444',
  hudGlass: 'rgba(69,10,10,0.88)',
  hudBorder: 'rgba(248,113,113,0.35)',
  cue: '#FEE2E2',
};

export const FAST_CATCH_COPY: SpeedMatchCopy = {
  gameTitle: 'Lightning Catch',
  emoji: '⚡',
  tagline: 'Speed Arena · Reaction Time',
  introBody: 'A blazing ball streaks across the arena. Tap it before it slips away — train your lightning reflexes!',
  chips: ['⚡ Fast', '👆 Tap', '🎯 React'],
  startLabel: 'Go Fast',
  startGradient: ['#F87171', '#EF4444', '#DC2626'],
  congrats: 'Lightning Hands!',
  scoreLabel: 'CATCHES',
  rootBg: '#450A0A',
  backdrop: 'stadium',
};

export const SLOW_CATCH_THEME: Session2ThemeTokens = {
  sky: ['#14532D', '#166534', '#15803D', '#22C55E'],
  title: '#BBF7D0',
  subtitle: '#86EFAC',
  accent: '#4ADE80',
  accentDark: '#22C55E',
  hudGlass: 'rgba(20,83,45,0.85)',
  hudBorder: 'rgba(74,222,128,0.35)',
  cue: '#DCFCE7',
};

export const SLOW_CATCH_COPY: SpeedMatchCopy = {
  gameTitle: 'Zen Catch',
  emoji: '🐢',
  tagline: 'Meadow Pace · Controlled Timing',
  introBody: 'A gentle ball drifts through the calm meadow. Take your time and tap with steady, controlled precision.',
  chips: ['🐢 Slow', '👆 Tap', '🧘 Steady'],
  startLabel: 'Enter Meadow',
  startGradient: ['#4ADE80', '#22C55E', '#16A34A'],
  congrats: 'Zen Master!',
  scoreLabel: 'CATCHES',
  rootBg: '#14532D',
  backdrop: 'meadow',
};

export const SPEED_SWITCH_THEME: Session2ThemeTokens = {
  sky: ['#78350F', '#92400E', '#B45309', '#D97706'],
  title: '#FEF3C7',
  subtitle: '#FDE68A',
  accent: '#FBBF24',
  accentDark: '#F59E0B',
  hudGlass: 'rgba(120,53,15,0.88)',
  hudBorder: 'rgba(251,191,36,0.35)',
  cue: '#FEF9C3',
};

export const SPEED_SWITCH_COPY: SpeedMatchCopy = {
  gameTitle: 'Turbo Toggle',
  emoji: '🔄',
  tagline: 'Dual Speed · Adaptability',
  introBody: 'The ball shifts between turbo and crawl speed without warning. Adapt your timing and catch it either way!',
  chips: ['⚡ Turbo', '🐢 Crawl', '🔄 Switch'],
  startLabel: 'Start Toggle',
  startGradient: ['#FBBF24', '#F59E0B', '#D97706'],
  congrats: 'Adaptation Ace!',
  scoreLabel: 'CATCHES',
  rootBg: '#78350F',
  backdrop: 'turbo',
};

export const COUNTDOWN_THEME: Session2ThemeTokens = {
  sky: ['#1E1B4B', '#312E81', '#4338CA', '#6366F1'],
  title: '#E0E7FF',
  subtitle: '#C7D2FE',
  accent: '#818CF8',
  accentDark: '#6366F1',
  hudGlass: 'rgba(30,27,75,0.88)',
  hudBorder: 'rgba(129,140,248,0.4)',
  cue: '#EEF2FF',
};

export const COUNTDOWN_COPY: SpeedMatchCopy = {
  gameTitle: 'Timer Strike',
  emoji: '⏰',
  tagline: 'Countdown Arena · Anticipation',
  introBody: 'Watch the countdown tick down… then strike the target the instant it appears. Perfect timing wins!',
  chips: ['⏰ Wait', '3-2-1', '🎯 Strike'],
  startLabel: 'Arm Timer',
  startGradient: ['#818CF8', '#6366F1', '#4F46E5'],
  congrats: 'Timing Pro!',
  scoreLabel: 'HITS',
  rootBg: '#312E81',
  backdrop: 'clock',
};

export const MUSIC_SPEED_THEME: Session2ThemeTokens = {
  sky: ['#4C1D95', '#6B21A8', '#7E22CE', '#A855F7'],
  title: '#F3E8FF',
  subtitle: '#E9D5FF',
  accent: '#C084FC',
  accentDark: '#A855F7',
  hudGlass: 'rgba(76,29,149,0.88)',
  hudBorder: 'rgba(192,132,252,0.4)',
  cue: '#FAE8FF',
};

export const MUSIC_SPEED_COPY: SpeedMatchCopy = {
  gameTitle: 'Beat Blitz',
  emoji: '🎵',
  tagline: 'Rhythm Stage · Auditory Sync',
  introBody: 'Feel the beat pulse through the disco stage. Tap the glowing note exactly when it appears on the rhythm!',
  chips: ['🎵 Beat', '👂 Listen', '🎯 Tap'],
  startLabel: 'Drop the Beat',
  startGradient: ['#C084FC', '#A855F7', '#9333EA'],
  congrats: 'Rhythm Star!',
  scoreLabel: 'BEATS',
  rootBg: '#4C1D95',
  backdrop: 'disco',
};

export const SPEED_MATCH_THEMES: Record<string, SpeedMatchThemeBundle> = {
  'fast-catch': { theme: FAST_CATCH_THEME, copy: FAST_CATCH_COPY },
  'slow-catch': { theme: SLOW_CATCH_THEME, copy: SLOW_CATCH_COPY },
  'speed-switch': { theme: SPEED_SWITCH_THEME, copy: SPEED_SWITCH_COPY },
  'countdown-hit': { theme: COUNTDOWN_THEME, copy: COUNTDOWN_COPY },
  'music-speed': { theme: MUSIC_SPEED_THEME, copy: MUSIC_SPEED_COPY },
};

export function getSpeedMatchTheme(logType: string): SpeedMatchThemeBundle {
  return SPEED_MATCH_THEMES[logType] ?? SPEED_MATCH_THEMES['fast-catch']!;
}
