/** Session 10 — Crown Hall hub theme (Level 1 finale). */
export const HUB_S10 = {
  bgTop: '#1A0A00',
  bgMid: '#78350F',
  bgBottom: '#B45309',
  accent: '#FBBF24',
  accentLight: '#FEF3C7',
  silver: '#D6D3D1',
  textLight: '#FFFBEB',
  textMuted: '#FDE68A',
} as const;

export type StudioS10 = {
  step: number;
  icon: string;
  title: string;
  desc: string;
  accent: string;
  accentLight: string;
  border: string;
};

export const STUDIOS_S10: StudioS10[] = [
  {
    step: 1,
    icon: '👑',
    title: 'Alphabet Crown',
    desc: 'Write the entire alphabet A–Z',
    accent: '#F59E0B',
    accentLight: '#FEF3C7',
    border: '#FBBF24',
  },
  {
    step: 2,
    icon: '🔊',
    title: 'Echo Chamber',
    desc: 'Hear a letter, write from memory',
    accent: '#6366F1',
    accentLight: '#E0E7FF',
    border: '#818CF8',
  },
  {
    step: 3,
    icon: '🔥',
    title: 'Triad Trial',
    desc: 'Identify → write → trace combo',
    accent: '#EF4444',
    accentLight: '#FEE2E2',
    border: '#F87171',
  },
  {
    step: 4,
    icon: '🎨',
    title: 'Artistry Studio',
    desc: 'Creative letter styles & fun prompts',
    accent: '#EC4899',
    accentLight: '#FCE7F3',
    border: '#F472B6',
  },
  {
    step: 5,
    icon: '📜',
    title: 'Royal Decree',
    desc: 'Write A–Z on paper & upload',
    accent: '#FCD34D',
    accentLight: '#FEF9C3',
    border: '#FDE047',
  },
];

export const JOURNEY_MILESTONES = [
  'Session 1: Aurora Sketch Studio',
  'Session 2: Crystal Orb Studio',
  'Session 3: Moon Arch Bridge',
  'Session 4: Alphabet Atelier',
  'Session 5: Glyph Gallery',
  'Session 6: A–Z Expedition',
  'Session 7: Independence Trail',
  'Session 8: Scribe\'s Gallery',
  'Session 9: Writer\'s Forge',
  'Session 10: Crown Hall ✅',
];
