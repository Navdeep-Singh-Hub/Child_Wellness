/**
 * OT Level 10 · Session 3 · Game 2 — Lava Shift · "Volcanic Safe-Stone Run"
 *
 * Molten amber + volcanic charcoal + ember glow.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const LAVA_SHELL = {
  backText: '#FED7AA',
  backBorder: 'rgba(254,215,170,0.35)',
  statLabel: '#FDBA74',
  statValue: '#FFF7ED',
  statBorder: 'rgba(251,146,60,0.45)',
  stageBorder: 'rgba(239,68,68,0.55)',
  stageBg: 'rgba(28,25,23,0.78)',
  good: '#34D399',
  warn: '#EF4444',
  gold: '#FDE68A',
  sparkleColor: '#FB923C',
  glassBorder: 'rgba(251,146,60,0.35)',
  academyLabel: 'LAVA ADAPT LAB',
  safeStone: '#78716C',
  safeActive: '#A8A29E',
  lava: '#EA580C',
} as const;

export type SafeStone = Point & {
  label: string;
  emoji: string;
  radius: number;
};

export type LavaShiftRound = {
  id: string;
  stoneA: SafeStone;
  stoneB: SafeStone;
  voiceSafe: string;
  voiceShift: string;
  voiceEscape: string;
  escapeCue: string;
};

export const LAVA_SHIFT_THEME = {
  title: 'Lava Shift',
  subtitle: 'Jump between safe stones when the lava shifts — adapt your movement to escape the heat!',
  emoji: '🌋',
  hero: '🪨',
  accent: '#F97316',
  accentEmber: '#EF4444',
  accentAsh: '#A8A29E',
  glow: 'rgba(249,115,22,0.55)',
  bgGradient: ['#1C1917', '#431407', '#7F1D1D', '#EA580C'] as [string, string, string, string],
  decor: ['🌋', '🔥', '🪨', '💨', '✨', '🌡️', '♨️', '🧗'],
  hintText: 'Stand on the safe stone — when lava shifts, move fast to the new safe rock!',
  positionCue: 'Face the camera so we can track your escape movement.',
  safeLabel: 'SAFE ZONE',
  shiftLabel: 'LAVA SHIFT!',
  escapeLabel: 'ESCAPE!',
  holdLabel: 'HOLD SAFE!',
  voiceIntro:
    'Welcome to the Volcanic Run! Each round starts on a safe stone. When the lava shifts, jump to the new safe zone and hold steady!',
  voiceComplete: 'Incredible escapes! You adapted through every lava shift like a volcano runner!',
  congrats: 'Lava Escape Champion!',
  skillTags: [
    'adaptive-responses',
    'motor-planning',
    'sensory-integration',
    'self-regulation',
    'functional-participation',
  ],
} as const;

const stone = (label: string, emoji: string, x: number, y: number): SafeStone => ({
  label,
  emoji,
  x,
  y,
  radius: 0.105,
});

export const LAVA_SHIFT_ROUNDS: LavaShiftRound[] = [
  {
    id: 'left-right',
    stoneA: stone('Rock A', '🪨', 0.2, 0.55),
    stoneB: stone('Rock B', '🗿', 0.8, 0.5),
    voiceSafe: 'Start on the left safe stone!',
    voiceShift: 'Lava shift! The left stone is sinking!',
    voiceEscape: 'Escape right to the new safe stone!',
    escapeCue: 'Move right — escape the lava!',
  },
  {
    id: 'low-high',
    stoneA: stone('Low Rock', '🪨', 0.5, 0.72),
    stoneB: stone('High Rock', '⛰️', 0.5, 0.24),
    voiceSafe: 'Safe on the low stone — lava is below!',
    voiceShift: 'Lava rising! Low stone is gone!',
    voiceEscape: 'Climb up to the high safe stone!',
    escapeCue: 'Reach up high to escape!',
  },
  {
    id: 'right-left',
    stoneA: stone('East Rock', '🪨', 0.82, 0.42),
    stoneB: stone('West Rock', '🗿', 0.18, 0.58),
    voiceSafe: 'Stand on the right safe rock!',
    voiceShift: 'Shift! Lava floods the right side!',
    voiceEscape: 'Escape left to safety!',
    escapeCue: 'Quick — move left away from lava!',
  },
  {
    id: 'center-corner',
    stoneA: stone('Center', '◎', 0.5, 0.48),
    stoneB: stone('Corner', '🪨', 0.78, 0.72),
    voiceSafe: 'Center stone is safe for now…',
    voiceShift: 'Lava burst! Center is melting!',
    voiceEscape: 'Run to the corner safe stone!',
    escapeCue: 'Diagonal escape to the corner rock!',
  },
  {
    id: 'final-leap',
    stoneA: stone('Start', '🪨', 0.35, 0.62),
    stoneB: stone('Summit', '🏔️', 0.65, 0.28),
    voiceSafe: 'Last round — find the start stone!',
    voiceShift: 'Final lava shift! Huge eruption!',
    voiceEscape: 'Leap to the summit stone!',
    escapeCue: 'Big adaptive leap to the summit!',
  },
];
