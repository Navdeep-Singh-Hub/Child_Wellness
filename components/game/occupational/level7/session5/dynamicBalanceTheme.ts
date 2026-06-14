/**
 * OT Level 7 · Session 5 — "Dynamic Standing Balance"
 * Ocean-crossing palette (deep sea → teal → sky → sand gold).
 */

export type BalanceMode = 'balanceBridge' | 'steppingStones' | 'islandHopper' | 'riverCrossing' | 'starTrail';

export const BALANCE_SHELL = {
  gradient: ['#082F49', '#0E7490', '#0EA5E9', '#FBBF24'] as [string, string, string, string],
  backText: '#BAE6FD',
  backBorder: 'rgba(186,230,253,0.35)',
  titleColor: '#FFFFFF',
  subtitleColor: '#7DD3FC',
  statLabel: '#38BDF8',
  statValue: '#FEF3C7',
  statBorder: 'rgba(56,189,248,0.4)',
  stageBorder: 'rgba(56,189,248,0.45)',
  stageBg: 'rgba(8,47,73,0.55)',
  gold: '#FBBF24',
  good: '#34D399',
  warn: '#FB7185',
  sparkleColor: '#7DD3FC',
} as const;

export type BalanceGameTheme = {
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
  /** Show stepping-stone path overlay. */
  showTrail?: boolean;
};

export const BALANCE_GAME_THEMES: Record<BalanceMode, BalanceGameTheme> = {
  balanceBridge: {
    title: 'Balance Bridge',
    subtitle: 'Walk heel-to-toe across the magical bridge to the castle!',
    emoji: '🌉',
    hero: '🏰',
    accent: '#A78BFA',
    accentDeep: '#6D28D9',
    glow: 'rgba(167,139,250,0.55)',
    hintText: 'Stay centered and steady — take each careful step!',
    voiceIntro: 'Cross the magical bridge! Walk slowly and steadily to the castle!',
    voiceComplete: 'You reached the castle! Beautifully balanced crossing!',
    congrats: 'Bridge Balance Champion!',
    showTrail: true,
  },
  steppingStones: {
    title: 'Stepping Stones',
    subtitle: 'Step from stone to stone across the river — keep your balance!',
    emoji: '🪨',
    hero: '🧒',
    accent: '#38BDF8',
    accentDeep: '#0369A1',
    glow: 'rgba(56,189,248,0.5)',
    hintText: 'Shift onto each glowing stone, then steady your balance!',
    voiceIntro: 'Cross the river! Step from stone to stone and balance after each step!',
    voiceComplete: 'You crossed the whole river! Amazing stepping!',
    congrats: 'Stepping Stone Hero!',
    showTrail: true,
  },
  islandHopper: {
    title: 'Island Hopper',
    subtitle: 'Hop between islands to collect treasures — avoid the water!',
    emoji: '🏝️',
    hero: '🐵',
    accent: '#34D399',
    accentDeep: '#047857',
    glow: 'rgba(52,211,153,0.5)',
    hintText: 'Move to each island and land balanced — then recover!',
    voiceIntro: 'Hop between the islands! Land with great balance and grab the treasures!',
    voiceComplete: 'Every island reached! Super island hopper!',
    congrats: 'Island Hopper Champion!',
    showTrail: true,
  },
  riverCrossing: {
    title: 'River Crossing',
    subtitle: 'Cross the fast river — follow changing paths and recover balance!',
    emoji: '🌊',
    hero: '🛶',
    accent: '#22D3EE',
    accentDeep: '#0E7490',
    glow: 'rgba(34,211,238,0.5)',
    hintText: 'Follow each move — step, stop and balance to cross safely!',
    voiceIntro: 'The river is fast! Follow each path and recover your balance!',
    voiceComplete: 'You crossed safely! Great balance recovery!',
    congrats: 'River Crossing Champion!',
  },
  starTrail: {
    title: 'Star Trail',
    subtitle: 'Follow the star trail through space — walk, turn and reach!',
    emoji: '⭐',
    hero: '🚀',
    accent: '#FBBF24',
    accentDeep: '#B45309',
    glow: 'rgba(251,191,36,0.55)',
    hintText: 'Walk, turn and balance to collect every star!',
    voiceIntro: 'Follow the star trail! Walk, turn and balance to collect all the stars!',
    voiceComplete: 'You collected every star! A true balance explorer!',
    congrats: 'Star Trail Champion!',
  },
};
