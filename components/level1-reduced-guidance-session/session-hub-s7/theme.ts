/** Session 7 — Independence Trail hub theme. */
export const HUB_S7 = {
  bgTop: '#1E293B',
  bgMid: '#334155',
  bgBottom: '#475569',
  accent: '#F59E0B',
  accentLight: '#FDE68A',
  silver: '#94A3B8',
  textLight: '#F8FAFC',
  textMuted: '#CBD5E1',
} as const;

export type StudioS7 = {
  step: number;
  icon: string;
  title: string;
  desc: string;
  accent: string;
  accentLight: string;
  border: string;
};

export const STUDIOS_S7: StudioS7[] = [
  {
    step: 1,
    icon: '👁️',
    title: 'Whisper Dots Studio',
    desc: 'Faint dots only — no arrows',
    accent: '#A78BFA',
    accentLight: '#EDE9FE',
    border: '#C4B5FD',
  },
  {
    step: 2,
    icon: '✨',
    title: 'Silent Outline',
    desc: 'Thin outline, no glow helpers',
    accent: '#6366F1',
    accentLight: '#E0E7FF',
    border: '#818CF8',
  },
  {
    step: 3,
    icon: '🧠',
    title: 'Mind Palace',
    desc: 'See the letter, hide it, then trace',
    accent: '#EC4899',
    accentLight: '#FCE7F3',
    border: '#F472B6',
  },
  {
    step: 4,
    icon: '🎲',
    title: 'Wildcard Workshop',
    desc: 'Random letters — full independence',
    accent: '#14B8A6',
    accentLight: '#CCFBF1',
    border: '#2DD4BF',
  },
  {
    step: 5,
    icon: '📓',
    title: 'Independence Journal',
    desc: 'Write A–Z with light dots on paper',
    accent: '#F59E0B',
    accentLight: '#FEF3C7',
    border: '#FBBF24',
  },
];
