/** Session 3 — River Bend Quest hub theme. */
export const HUB_S3 = {
  bgTop: '#1E1B4B',
  bgMid: '#312E81',
  bgBottom: '#4C1D95',
  accent: '#FB7185',
  accentLight: '#FECDD3',
  coral: '#F97316',
  gold: '#FBBF24',
  textLight: '#F8FAFC',
  textMuted: '#C4B5FD',
} as const;

export type StudioS3 = {
  step: number;
  icon: string;
  title: string;
  desc: string;
  accent: string;
  accentLight: string;
  border: string;
};

export const STUDIOS_S3: StudioS3[] = [
  {
    step: 1,
    icon: '🌉',
    title: 'Moon Arch Bridge',
    desc: 'Trace semicircle, wave & circle paths',
    accent: '#818CF8',
    accentLight: '#E0E7FF',
    border: '#A5B4FC',
  },
  {
    step: 2,
    icon: '🌿',
    title: 'Swoosh Garden',
    desc: 'Draw your own flowing curves',
    accent: '#34D399',
    accentLight: '#D1FAE5',
    border: '#6EE7B7',
  },
  {
    step: 3,
    icon: '📜',
    title: 'Curve Chronicle',
    desc: 'Sketch curves on paper & photograph',
    accent: '#F59E0B',
    accentLight: '#FEF3C7',
    border: '#FCD34D',
  },
];
