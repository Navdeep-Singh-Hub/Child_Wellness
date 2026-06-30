/** Thunder Forge — Game 1 visual & UX tokens (OT Level 6 · Session 1) */
export const TF = {
  bg: ['#0C0A09', '#1C1917', '#44403C', '#78350F'] as const,
  accent: '#F59E0B',
  accentBright: '#FBBF24',
  accentGlow: '#FDE047',
  molten: '#EA580C',
  steam: 'rgba(254,243,199,0.35)',
  reactorCore: '#FCD34D',
  reactorTrack: 'rgba(15,12,41,0.75)',
  textLight: '#FFFBEB',
  textMuted: '#FDE68A',
  glass: 'rgba(120,53,15,0.28)',
  glassBorder: 'rgba(251,191,36,0.42)',
  good: '#34D399',
  warn: '#FB7185',
} as const;

export const TF_CHIPS = ['⚡ Reactor', '🦸 Tall Sit', '💪 Core Power'] as const;

export const TF_INTRO_STEPS = [
  { icon: '🦸', title: 'Mission Brief', body: 'Sit tall like a superhero to charge the Thunder Forge reactor.' },
  { icon: '📷', title: 'Forge Cam', body: 'The camera watches your posture — or play guided mode without a camera.' },
  { icon: '⚡', title: 'Ignite', body: 'Hold still while the reactor calibrates, then fill the power meter!' },
] as const;
