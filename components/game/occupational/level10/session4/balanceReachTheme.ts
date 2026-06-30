/**
 * OT Level 10 · Session 4 · Game 1 — Balance & Reach · "Zen Balance Bridge"
 *
 * Soft teal + lavender stone bridge palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const BALANCE_SHELL = {
  backText: '#CCFBF1',
  backBorder: 'rgba(204,251,241,0.35)',
  statLabel: '#C4B5FD',
  statValue: '#F0FDFA',
  statBorder: 'rgba(196,181,253,0.45)',
  stageBorder: 'rgba(45,212,191,0.55)',
  stageBg: 'rgba(15,23,42,0.78)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#5EEAD4',
  glassBorder: 'rgba(45,212,191,0.35)',
  academyLabel: 'SENSORY-MOTOR LAB',
  platform: '#94A3B8',
  platformActive: '#5EEAD4',
} as const;

export type ReachHand = 'left' | 'right';

export type BalanceReachChallenge = {
  id: string;
  hand: ReachHand;
  label: string;
  emoji: string;
  color: string;
  voiceBalance: string;
  voiceReach: string;
  reachCue: string;
  reach: Point & { radius: number };
};

export const BALANCE_REACH_THEME = {
  title: 'Balance & Reach',
  subtitle: 'Hold steady on the balance bridge — then reach for the glow orb without losing your center!',
  emoji: '⚖️',
  hero: '🧘',
  accent: '#2DD4BF',
  accentLavender: '#A78BFA',
  glow: 'rgba(45,212,191,0.5)',
  bgGradient: ['#0F172A', '#134E4A', '#312E81', '#0D9488'] as [string, string, string, string],
  decor: ['⚖️', '🌉', '✨', '🧘', '🍃', '💫', '🪨', '🤲'],
  hintText: 'Center your body on the bridge — balance, then reach for the orb!',
  positionCue: 'Show your full upper body and hands — we track balance and reach.',
  balanceLabel: 'BALANCE!',
  reachLabel: 'REACH!',
  holdBalanceLabel: 'HOLD STEADY!',
  holdReachLabel: 'HOLD REACH!',
  voiceIntro:
    'Welcome to the Zen Balance Bridge! Each round you balance your body in the center — then reach for a glowing orb while staying steady.',
  voiceComplete: 'Beautiful balance and reach! You integrated every challenge like a sensory-motor champion!',
  congrats: 'Balance Reach Pro!',
  skillTags: [
    'sensory-integration',
    'motor-planning',
    'balance',
    'adaptive-responses',
    'functional-participation',
  ],
} as const;

/** Center balance platform — shoulder mid should stay here. */
export const BALANCE_PLATFORM = {
  x: 0.5,
  y: 0.56,
  radius: 0.11,
} as const;

/** Looser zone during reach phase. */
export const BALANCE_REACH_LOOSE = {
  x: 0.5,
  y: 0.56,
  radius: 0.15,
} as const;

const reach = (hand: ReachHand, label: string, emoji: string, color: string, x: number, y: number): BalanceReachChallenge => ({
  id: `${hand}-${label.toLowerCase().replace(/\s/g, '-')}`,
  hand,
  label,
  emoji,
  color,
  voiceBalance: 'Center on the bridge — hold your balance steady!',
  voiceReach: hand === 'left'
    ? `Now reach LEFT with your left hand to ${label}!`
    : `Now reach RIGHT with your right hand to ${label}!`,
  reachCue: hand === 'left' ? 'Reach left — stay balanced!' : 'Reach right — stay balanced!',
  reach: { x, y, radius: 0.1 },
});

export const BALANCE_REACH_CHALLENGES: BalanceReachChallenge[] = [
  {
    ...reach('left', 'Sky Orb', '⭐', '#A78BFA', 0.22, 0.28),
    voiceBalance: 'Stand tall on the bridge — find your center!',
    voiceReach: 'Balance held! Reach LEFT high to Sky Orb!',
    reachCue: 'Stretch left up — keep your core steady!',
  },
  {
    ...reach('right', 'River Orb', '💧', '#38BDF8', 0.78, 0.38),
    voiceBalance: 'Hold steady in the center zone!',
    voiceReach: 'Great balance! Reach RIGHT to River Orb!',
    reachCue: 'Extend right — do not tip over!',
  },
  {
    ...reach('left', 'Moss Orb', '🍃', '#34D399', 0.2, 0.52),
    voiceBalance: 'Feel your feet — balance on the bridge!',
    voiceReach: 'Now reach LEFT to Moss Orb!',
    reachCue: 'Left hand to moss — stay centered!',
  },
  {
    ...reach('right', 'Sun Orb', '☀️', '#FBBF24', 0.8, 0.55),
    voiceBalance: 'Hold your center — breathe steady!',
    voiceReach: 'Reach RIGHT to Sun Orb while balanced!',
    reachCue: 'Right reach — keep shoulders level!',
  },
  {
    ...reach('left', 'Star Orb', '✨', '#E879F9', 0.28, 0.72),
    voiceBalance: 'Final balance — lock your center!',
    voiceReach: 'Reach LEFT low to Star Orb!',
    reachCue: 'Low left reach — balance wins!',
  },
];
