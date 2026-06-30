/** Design tokens — OT Level 5 Session 6 · Game 1 · Lightning Catch */
export const LIGHTNING_CATCH_THEME = {
  sky: ['#450A0A', '#7F1D1D', '#B91C1C', '#DC2626'] as const,
  floor: 'rgba(0,0,0,0.25)',
  speedLine: 'rgba(255,255,255,0.12)',
  spotlight: 'rgba(248,113,113,0.2)',
  ball: '#EF4444',
  ballGlow: 'rgba(239,68,68,0.5)',
  trail: '#FCA5A5',
  hudGlass: 'rgba(69,10,10,0.9)',
  hudBorder: 'rgba(248,113,113,0.4)',
  title: '#FECACA',
  subtitle: '#FCA5A5',
  accent: '#F87171',
  accentDark: '#EF4444',
} as const;

export const LIGHTNING_CATCH_COPY = {
  title: 'Lightning Catch',
  emoji: '⚡',
  subtitle: 'Speed Arena · Reaction Time',
  introDescription: 'A blazing ball streaks across the red arena. Tap it before it slips away — train your lightning reflexes!',
  ttsIntro: 'Welcome to Lightning Catch! Tap the fast ball!',
  ttsStart: 'Catch the fast ball!',
  ttsSuccess: 'Lightning catch!',
  ttsComplete: 'Incredible! Your reflexes are lightning fast!',
  congratsMessage: 'Lightning Hands!',
  logType: 'fast-catch',
  skillTags: ['reaction-speed', 'hand-eye-coordination', 'fast-timing'],
  instruction: 'Catch the blazing ball!',
} as const;
