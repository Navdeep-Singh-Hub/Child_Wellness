/** Session 2 — Boundary Quest hub theme. */
export const HUB_S2 = {
  bgTop: '#042F2E',
  bgMid: '#0F766E',
  bgBottom: '#134E4A',
  accent: '#2DD4BF',
  accentLight: '#99F6E4',
  gold: '#FDE047',
  textLight: '#F0FDFA',
  textMuted: '#5EEAD4',
} as const;

export type StudioS2 = {
  step: number;
  icon: string;
  title: string;
  desc: string;
  accent: string;
  accentLight: string;
  border: string;
};

export const STUDIOS_S2: StudioS2[] = [
  {
    step: 1,
    icon: '🔮',
    title: 'Crystal Orb Studio',
    desc: 'Scribble inside the glowing orb',
    accent: '#06B6D4',
    accentLight: '#CFFAFE',
    border: '#22D3EE',
  },
  {
    step: 2,
    icon: '⛰️',
    title: 'Pyramid Peak',
    desc: 'Fill the mountain triangle',
    accent: '#D97706',
    accentLight: '#FFEDD5',
    border: '#FBBF24',
  },
  {
    step: 3,
    icon: '🔬',
    title: 'Shrink Lab',
    desc: 'Big circle → square → triangle',
    accent: '#7C3AED',
    accentLight: '#EDE9FE',
    border: '#A78BFA',
  },
  {
    step: 4,
    icon: '🛡️',
    title: 'Fortress Gate',
    desc: 'Guard the boundary — 70% accuracy',
    accent: '#DC2626',
    accentLight: '#FEE2E2',
    border: '#F87171',
  },
  {
    step: 5,
    icon: '🏛️',
    title: 'Control Exhibit',
    desc: 'Photograph your bounded scribble',
    accent: '#0D9488',
    accentLight: '#CCFBF1',
    border: '#2DD4BF',
  },
];
