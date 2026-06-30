/** Sunset Trail — visual identity for Follow the Path (Game 4). */
export const SUNSET = {
  skyTop: '#F97316',
  skyMid: '#FB923C',
  skyBottom: '#FDE68A',
  horizon: '#FBBF24',
  water: '#38BDF8',
  waterDeep: '#0EA5E9',
  waterGlow: 'rgba(56,189,248,0.35)',
  pathCore: '#FDE047',
  pathOuter: 'rgba(253,224,71,0.35)',
  land: '#86EFAC',

  textDark: '#7C2D12',
  textMuted: '#C2410C',
  textLight: '#FFF7ED',

  panel: 'rgba(255,255,255,0.82)',
  panelBorder: 'rgba(251,191,36,0.5)',
  error: '#DC2626',
  success: '#16A34A',

  accent: '#EA580C',
} as const;

export const GAME4_CONFIG = {
  progressThreshold: 0.8,
  pathWidth: 70,
  mascotName: 'Ripple',
} as const;

export const TRAIL_HINTS = {
  idle: 'Start at the beginning of the golden trail!',
  tracing: (pct: number) => `Following the river… ${pct}%`,
  errorStart: 'Begin at the start of the trail 🌅',
  errorOff: 'Oops! Stay on the glowing path.',
  errorJump: 'Follow smoothly — no skipping ahead!',
  success: 'You rode the sunset trail!',
} as const;
