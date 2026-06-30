/** Session 6 — A–Z Expedition hub theme. */
export const HUB_S6 = {
  bgTop: '#042F2E',
  bgMid: '#0F766E',
  bgBottom: '#134E4A',
  accent: '#34D399',
  accentLight: '#A7F3D0',
  gold: '#FDE047',
  textLight: '#F0FDFA',
  textMuted: '#5EEAD4',
} as const;

export type StudioS6 = {
  step: number;
  icon: string;
  title: string;
  desc: string;
  accent: string;
  accentLight: string;
  border: string;
};

export const STUDIOS_S6: StudioS6[] = [
  {
    step: 1,
    icon: '⭐',
    title: 'North Star Tracing',
    desc: 'A–Z with stroke animation & arrows',
    accent: '#38BDF8',
    accentLight: '#E0F2FE',
    border: '#7DD3FC',
  },
  {
    step: 2,
    icon: '🤝',
    title: 'Companion Trail',
    desc: 'Thick guided path — I help you stay on track',
    accent: '#A78BFA',
    accentLight: '#EDE9FE',
    border: '#C4B5FD',
  },
  {
    step: 3,
    icon: '💪',
    title: 'Muscle Memory Dojo',
    desc: 'Trace the same letter 3 times',
    accent: '#F97316',
    accentLight: '#FFEDD5',
    border: '#FB923C',
  },
  {
    step: 4,
    icon: '🔊',
    title: 'Echo Valley',
    desc: 'Hear each letter as you trace',
    accent: '#22D3EE',
    accentLight: '#CFFAFE',
    border: '#67E8F9',
  },
  {
    step: 5,
    icon: '📜',
    title: 'Alphabet Passport',
    desc: 'Trace A–Z on paper & photograph',
    accent: '#FBBF24',
    accentLight: '#FEF3C7',
    border: '#FCD34D',
  },
];
