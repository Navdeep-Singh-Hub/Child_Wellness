/** Session 4 — Letter Forge hub theme. */
export const HUB_S4 = {
  bgTop: '#0F172A',
  bgMid: '#1E293B',
  bgBottom: '#334155',
  accent: '#FBBF24',
  accentLight: '#FDE68A',
  chalk: '#F8FAFC',
  chalkMuted: '#94A3B8',
  gold: '#F59E0B',
} as const;

export type StudioS4 = {
  step: number;
  icon: string;
  title: string;
  desc: string;
  accent: string;
  accentLight: string;
  border: string;
};

export const STUDIOS_S4: StudioS4[] = [
  {
    step: 1,
    icon: '🎨',
    title: 'Alphabet Atelier',
    desc: 'Meet I, L, T, H, E, F — see & hear',
    accent: '#3B82F6',
    accentLight: '#DBEAFE',
    border: '#60A5FA',
  },
  {
    step: 2,
    icon: '🔦',
    title: 'Letter Lookout',
    desc: 'Spot the correct letter in 6 rounds',
    accent: '#8B5CF6',
    accentLight: '#EDE9FE',
    border: '#A78BFA',
  },
  {
    step: 3,
    icon: '🔧',
    title: 'Line Workshop',
    desc: 'Drag lines to build each letter',
    accent: '#F97316',
    accentLight: '#FFEDD5',
    border: '#FB923C',
  },
  {
    step: 4,
    icon: '✒️',
    title: 'Ink Trail Studio',
    desc: 'Dot-to-dot letter tracing',
    accent: '#10B981',
    accentLight: '#D1FAE5',
    border: '#34D399',
  },
  {
    step: 5,
    icon: '📒',
    title: 'Letter Ledger',
    desc: 'Write a letter on paper & photograph',
    accent: '#F59E0B',
    accentLight: '#FEF3C7',
    border: '#FBBF24',
  },
];
