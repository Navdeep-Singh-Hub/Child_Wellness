/** Session hub shared theme — ties all 5 studios together. */
export const HUB = {
  bgTop: '#1E1B4B',
  bgMid: '#312E81',
  bgBottom: '#4C1D95',
  gold: '#FBBF24',
  goldLight: '#FDE68A',
  textLight: '#F8FAFC',
  textMuted: '#C4B5FD',
} as const;

export type StudioCardConfig = {
  step: number;
  icon: string;
  title: string;
  desc: string;
  accent: string;
  accentLight: string;
  border: string;
};

export const STUDIOS: StudioCardConfig[] = [
  {
    step: 1,
    icon: '🌌',
    title: 'Aurora Sketch Studio',
    desc: 'Paint colorful lines on magic paper',
    accent: '#8B5CF6',
    accentLight: '#EDE9FE',
    border: '#A78BFA',
  },
  {
    step: 2,
    icon: '🦋',
    title: 'Garden Bloom Studio',
    desc: 'Color the butterfly & sunflower',
    accent: '#16A34A',
    accentLight: '#DCFCE7',
    border: '#86EFAC',
  },
  {
    step: 3,
    icon: '✨',
    title: 'Dot Galaxy',
    desc: 'Tap stars into the night sky',
    accent: '#22D3EE',
    accentLight: '#CFFAFE',
    border: '#67E8F9',
  },
  {
    step: 4,
    icon: '🌅',
    title: 'Sunset Trail',
    desc: 'Follow the golden river path',
    accent: '#EA580C',
    accentLight: '#FFEDD5',
    border: '#FB923C',
  },
  {
    step: 5,
    icon: '🖼️',
    title: 'Masterpiece Gallery',
    desc: 'Exhibit your real paper scribble',
    accent: '#C9A227',
    accentLight: '#FEF9C3',
    border: '#FDE047',
  },
];
