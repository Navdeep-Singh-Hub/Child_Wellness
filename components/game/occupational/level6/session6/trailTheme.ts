/**
 * OT Level 6 · Session 6 — "Wild Trail (Dynamic Balance)"
 * Visual tokens. A warm autumn-forest-trail palette (deep pine → forest green →
 * olive → harvest gold) — adventurous and earthy, distinct from S1 violet,
 * S2 forest-emerald, S3 space-navy, S4 lagoon-teal, S5 sunset-magenta.
 */

export type DynamicMode = 'steppingStones' | 'crossBridge' | 'riverCrossing' | 'adventureTrail' | 'balanceJourney';

export const TRAIL_SHELL = {
  gradient: ['#0F2417', '#166534', '#4D7C0F', '#CA8A04'] as [string, string, string, string],
  backText: '#ECFCCB',
  backBorder: 'rgba(236,252,203,0.35)',
  titleColor: '#FFFFFF',
  subtitleColor: '#D9F99D',
  statLabel: '#BEF264',
  statValue: '#FDE68A',
  statBorder: 'rgba(190,242,100,0.4)',
  stageBorder: 'rgba(190,242,100,0.45)',
  stageBg: 'rgba(15,36,23,0.5)',
  gold: '#FBBF24',
  good: '#34D399',
  warn: '#FB7185',
  sparkleColor: '#BEF264',
} as const;

export type DynamicGameTheme = {
  title: string;
  subtitle: string;
  emoji: string;
  hero: string;
  accent: string;
  accentDeep: string;
  glow: string;
  hintText: string;
  voiceIntro: string;
  voiceComplete: string;
  congrats: string;
};

export const DYNAMIC_GAME_THEMES: Record<DynamicMode, DynamicGameTheme> = {
  steppingStones: {
    title: 'Stepping Stones',
    subtitle: 'Step stone to stone to cross the river — don\u2019t fall in!',
    emoji: '🪨',
    hero: '🧒',
    accent: '#38BDF8',
    accentDeep: '#0369A1',
    glow: 'rgba(56,189,248,0.5)',
    hintText: 'Shift onto the glowing stone, then steady your balance!',
    voiceIntro: 'Step from stone to stone and balance after each step!',
    voiceComplete: 'You crossed the whole river! Amazing stepping!',
    congrats: 'Stepping Stone Hero!',
  },
  crossBridge: {
    title: 'Cross The Bridge',
    subtitle: 'Walk heel-to-toe across the narrow bridge to the castle!',
    emoji: '🌉',
    hero: '🏰',
    accent: '#A78BFA',
    accentDeep: '#6D28D9',
    glow: 'rgba(167,139,250,0.5)',
    hintText: 'Stay steady and centered, then take each careful step!',
    voiceIntro: 'Walk slowly and steadily across the narrow bridge!',
    voiceComplete: 'You reached the castle! Steady and strong!',
    congrats: 'Bridge Crossing Champion!',
  },
  riverCrossing: {
    title: 'River Crossing',
    subtitle: 'Jump between safe islands and land with steady balance!',
    emoji: '🌊',
    hero: '🐸',
    accent: '#22D3EE',
    accentDeep: '#0E7490',
    glow: 'rgba(34,211,238,0.5)',
    hintText: 'Jump to the glowing island and land balanced — then recover!',
    voiceIntro: 'Hop to the safe islands and land with great balance!',
    voiceComplete: 'You hopped across safely! Super landings!',
    congrats: 'River Crossing Champion!',
  },
  adventureTrail: {
    title: 'Adventure Trail',
    subtitle: 'Follow the trail arrows and movements through the forest!',
    emoji: '🚶',
    hero: '🧭',
    accent: '#84CC16',
    accentDeep: '#3F6212',
    glow: 'rgba(132,204,22,0.5)',
    hintText: 'Follow each arrow and movement in order — stay balanced!',
    voiceIntro: 'Follow the trail! Step, turn and stop as the arrows show!',
    voiceComplete: 'You finished the forest trail! Wonderful moving!',
    congrats: 'Trail Adventurer!',
  },
  balanceJourney: {
    title: 'Balance Journey',
    subtitle: 'The grand challenge — step, turn and stop your way to victory!',
    emoji: '🏆',
    hero: '🏆',
    accent: '#FBBF24',
    accentDeep: '#B45309',
    glow: 'rgba(251,191,36,0.55)',
    hintText: 'Complete the whole course — stepping, turning and stopping!',
    voiceIntro: 'The grand balance journey begins! Follow every move!',
    voiceComplete: 'You completed the grand balance journey! A true champion!',
    congrats: 'Grand Balance Champion!',
  },
};
