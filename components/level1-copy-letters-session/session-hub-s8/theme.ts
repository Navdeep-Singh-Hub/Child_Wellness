/** Session 8 — Scribe's Gallery hub theme. */
export const HUB_S8 = {
  bgTop: '#0F172A',
  bgMid: '#1E3A8A',
  bgBottom: '#1D4ED8',
  accent: '#60A5FA',
  accentLight: '#BFDBFE',
  silver: '#94A3B8',
  textLight: '#F8FAFC',
  textMuted: '#CBD5E1',
} as const;

export type StudioS8 = {
  step: number;
  icon: string;
  title: string;
  desc: string;
  accent: string;
  accentLight: string;
  border: string;
};

export const STUDIOS_S8: StudioS8[] = [
  {
    step: 1,
    icon: '🪞',
    title: 'Mirror Desk',
    desc: 'Reference left, write right — no tracing',
    accent: '#3B82F6',
    accentLight: '#DBEAFE',
    border: '#60A5FA',
  },
  {
    step: 2,
    icon: '⚡',
    title: 'Flash Recall',
    desc: 'See it, hide it, write from memory',
    accent: '#8B5CF6',
    accentLight: '#EDE9FE',
    border: '#A78BFA',
  },
  {
    step: 3,
    icon: '🔗',
    title: 'Letter Chain',
    desc: 'Copy sequences like A B C',
    accent: '#06B6D4',
    accentLight: '#CFFAFE',
    border: '#22D3EE',
  },
  {
    step: 4,
    icon: '📸',
    title: 'Copy Portfolio',
    desc: 'Write 5 letters on paper & upload',
    accent: '#F59E0B',
    accentLight: '#FEF3C7',
    border: '#FBBF24',
  },
];
