/** Royal Observatory — Game 2 visual & UX tokens (OT Level 6 · Session 1) */
export const RO = {
  bg: ['#0F0520', '#2E1065', '#581C87', '#86198F'] as const,
  accent: '#F472B6',
  accentDeep: '#BE185D',
  accentBright: '#F9A8D4',
  accentGlow: '#FBCFE8',
  roseGold: '#FBBF24',
  twilight: '#C084FC',
  dome: 'rgba(192,132,252,0.18)',
  glass: 'rgba(112,26,117,0.32)',
  glassBorder: 'rgba(244,114,182,0.45)',
  textLight: '#FDF4FF',
  textMuted: '#F5D0FE',
  good: '#34D399',
  warn: '#FB7185',
  star: '#FDE68A',
} as const;

export const RO_CHIPS = ['👑 Crown', '🔭 Steady Head', '✨ Royal Focus'] as const;

export const RO_INTRO_STEPS = [
  { icon: '👑', title: 'Royal Briefing', body: 'A magical crown rests on your head. Keep it balanced by holding your head tall and still.' },
  { icon: '🔭', title: 'Observatory Cam', body: 'The telescope lens watches your posture — or play guided mode without a camera.' },
  { icon: '✨', title: 'Crown Ceremony', body: 'Calibrate, then protect the crown through each watch while sparkles drift by!' },
] as const;
