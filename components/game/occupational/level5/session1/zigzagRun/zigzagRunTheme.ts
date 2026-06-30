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

export const ZIGZAG_RUN_COPY = {
  title: 'Zigzag Run',
  emoji: '〰️',
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
