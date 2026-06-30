/** Session 9 — Writer's Forge hub theme. */
export const HUB_S9 = {
  bgTop: '#1C0A0A',
  bgMid: '#7F1D1D',
  bgBottom: '#B91C1C',
  accent: '#F87171',
  accentLight: '#FECACA',
  silver: '#94A3B8',
  textLight: '#FEF2F2',
  textMuted: '#FCA5A5',
} as const;

export type StudioS9 = {
  step: number;
  icon: string;
  title: string;
  desc: string;
  accent: string;
  accentLight: string;
  border: string;
};

export const STUDIOS_S9: StudioS9[] = [
  {
    step: 1,
    icon: '✏️',
    title: 'Blank Canvas',
    desc: 'Write prompted letters — no help',
    accent: '#EF4444',
    accentLight: '#FEE2E2',
    border: '#F87171',
  },
  {
    step: 2,
    icon: '🎲',
    title: 'Lucky Draw',
    desc: 'Random letters appear — write each one',
    accent: '#A855F7',
    accentLight: '#F3E8FF',
    border: '#C084FC',
  },
  {
    step: 3,
    icon: '⚡',
    title: 'Lightning Lane',
    desc: 'Write before the timer runs out',
    accent: '#F59E0B',
    accentLight: '#FEF3C7',
    border: '#FBBF24',
  },
  {
    step: 4,
    icon: '🧩',
    title: 'Quiz Arena',
    desc: 'Identify the letter, then write it',
    accent: '#10B981',
    accentLight: '#D1FAE5',
    border: '#34D399',
  },
  {
    step: 5,
    icon: '📜',
    title: "Hero's Manuscript",
    desc: 'Write A–Z without dots & upload',
    accent: '#FCD34D',
    accentLight: '#FEF9C3',
    border: '#FDE047',
  },
];
