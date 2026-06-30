<<<<<<< HEAD
/**
 * Design tokens — OT Level 5 Session 1 · Game 5 · Zigzag Run
 * Palette: dark circuit board + neon violet/cyan (digital labyrinth)
 * Theory: path preview aids line-tracking / reading-prep skills
 */

export const ZIGZAG_RUN_THEME = {
  board: ['#0A0A0F', '#12121A', '#1A1A2E', '#16213E'] as const,
  grid: 'rgba(99,102,241,0.08)',
  gridBright: 'rgba(99,102,241,0.15)',
  pathGlow: 'rgba(139,92,246,0.35)',
  pathCore: '#8B5CF6',
  pathNode: '#A78BFA',
  pathActive: '#C4B5FD',
  runner: '#22D3EE',
  runnerCore: '#67E8F9',
  runnerGlow: 'rgba(34,211,238,0.55)',
  runnerTrail: 'rgba(34,211,238,0.3)',
  electric: '#F0ABFC',
  electricGlow: 'rgba(240,171,252,0.4)',
  hudGlass: 'rgba(26,26,46,0.9)',
  hudBorder: 'rgba(139,92,246,0.4)',
  title: '#F5F3FF',
  subtitle: '#C4B5FD',
  accent: '#8B5CF6',
  accentCyan: '#22D3EE',
  accentDark: '#6D28D9',
  success: '#34D399',
  successGlow: 'rgba(52,211,153,0.4)',
  nearMiss: '#F0ABFC',
  nearMissGlow: 'rgba(240,171,252,0.35)',
  miss: 'rgba(148,163,184,0.35)',
} as const;
=======
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
>>>>>>> parent of d0342ff (Revert "fgh")

export const ZIGZAG_RUN_COPY = {
  title: 'Zigzag Run',
  emoji: '〰️',
<<<<<<< HEAD
  subtitle: 'Follow the neon path — tap the runner',
  introDescription:
    'A glowing orb races along a zigzag circuit path. Follow the line with your eyes and tap the runner as it weaves left and right — great practice for reading!',
  skills: ['Line tracking', 'Visual pursuit', 'Reading preparation', 'Pattern following'],
  ttsIntro: 'Welcome to Zigzag Run! Follow the neon path and tap the runner!',
  ttsCue: 'Tap the runner on the zigzag!',
  ttsSuccess: 'Circuit complete!',
  ttsNearMiss: 'Almost! Follow the path!',
  ttsComplete: 'Amazing! You mastered every zigzag circuit!',
  congratsMessage: 'Circuit Master!',
  logType: 'zigzag-follow',
  skillTags: ['line-tracking', 'visual-tracking', 'reading-prep'],
  followHint: '〰️ Follow the path — tap the runner!',
  nearMissHint: 'So close to the runner!',
  missHint: 'Watch the zigzag path!',
} as const;
=======
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
>>>>>>> parent of d0342ff (Revert "fgh")
