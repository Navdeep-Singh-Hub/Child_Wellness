import type { Session2ThemeTokens } from '@/components/game/occupational/level5/session2/shared/Session2UI';

/** Synthwave split — electric cyan path + hot magenta runner on deep violet track. */
export const ZIGZAG_RUN_THEME: Session2ThemeTokens = {
  sky: ['#0A0118', '#1A0B2E', '#2D1B4E', '#3B0764'],
  title: '#F0ABFC',
  subtitle: '#C4B5FD',
  accent: '#22D3EE',
  accentDark: '#06B6D4',
  hudGlass: 'rgba(15,23,42,0.82)',
  hudBorder: 'rgba(34,211,238,0.32)',
  cue: '#F0ABFC',
};

export const ZIGZAG_RUN_COPY = {
  title: 'Zigzag Run',
  emoji: '〰️',
  tagline: 'Neon Circuit · Line Tracking',
  body: 'A glowing runner speeds along a neon zigzag wave. Read the path, react fast, and tap it as it weaves left and right!',
  chips: ['〰️ Zigzag', '👁️ Track', '⚡ React'],
  startLabel: 'Start the Run',
  startGradient: ['#22D3EE', '#06B6D4', '#0891B2'] as const,
  ttsIntro: 'Follow the zigzag path and tap the glowing runner!',
  ttsCue: 'Tap along the zigzag!',
  ttsSuccess: 'Perfect tap!',
  ttsComplete: 'Great zigzag tracking! Circuit complete!',
  congrats: 'Wave Runner!',
  logType: 'zigzag-follow',
  skillTags: ['line-tracking', 'visual-tracking', 'reading-prep'] as const,
  rootBg: '#0A0118',
} as const;

export const CIRCUIT = {
  gridLine: 'rgba(34,211,238,0.12)',
  pathGlow: '#22D3EE',
  pathCore: '#67E8F9',
  pathShadow: 'rgba(236,72,153,0.35)',
  runnerCore: '#E879F9',
  runnerRing: 'rgba(240,171,252,0.55)',
  runnerBadge: '#A21CAF',
  horizon: 'rgba(236,72,153,0.2)',
} as const;

export const RUNNER_SIZE = 64;
