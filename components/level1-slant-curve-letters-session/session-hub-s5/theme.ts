/** Session 5 — Alphabet Odyssey hub theme. */
export const HUB_S5 = {
  bgTop: '#4A044E',
  bgMid: '#701A75',
  bgBottom: '#86198F',
  accent: '#22D3EE',
  accentLight: '#A5F3FC',
  rose: '#F472B6',
  gold: '#FDE047',
  textLight: '#FAF5FF',
  textMuted: '#E9D5FF',
} as const;

export type StudioS5 = {
  step: number;
  icon: string;
  title: string;
  desc: string;
  accent: string;
  accentLight: string;
  border: string;
};

export const STUDIOS_S5: StudioS5[] = [
  {
    step: 1,
    icon: '🖼️',
    title: 'Glyph Gallery',
    desc: 'Meet A–Z slant & curve letters',
    accent: '#A855F7',
    accentLight: '#F3E8FF',
    border: '#C084FC',
  },
  {
    step: 2,
    icon: '🗼',
    title: 'Signal Tower',
    desc: 'Spot the correct letter — 8 rounds',
    accent: '#F97316',
    accentLight: '#FFEDD5',
    border: '#FB923C',
  },
  {
    step: 3,
    icon: '🏛️',
    title: "Architect's Bench",
    desc: 'Assemble slant & curve letter parts',
    accent: '#14B8A6',
    accentLight: '#CCFBF1',
    border: '#2DD4BF',
  },
  {
    step: 4,
    icon: '🏜️',
    title: 'Script Sands',
    desc: 'Trace all 14 letters dot-to-dot',
    accent: '#EAB308',
    accentLight: '#FEF9C3',
    border: '#FACC15',
  },
  {
    step: 5,
    icon: '🏺',
    title: 'Capital Archive',
    desc: 'Write any capital letter & photograph',
    accent: '#EC4899',
    accentLight: '#FCE7F3',
    border: '#F472B6',
  },
];
