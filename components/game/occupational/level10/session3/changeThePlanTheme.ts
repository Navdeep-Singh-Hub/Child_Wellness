/**
 * OT Level 10 · Session 3 · Game 1 — Change The Plan · "Shift Signal Bridge"
 *
 * Coral + teal command bridge — adaptive motor planning palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const SHIFT_SHELL = {
  backText: '#CCFBF1',
  backBorder: 'rgba(204,251,241,0.35)',
  statLabel: '#FDA4AF',
  statValue: '#F0FDFA',
  statBorder: 'rgba(253,164,175,0.45)',
  stageBorder: 'rgba(45,212,191,0.5)',
  stageBg: 'rgba(15,23,42,0.72)',
  good: '#2DD4BF',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#FB7185',
  glassBorder: 'rgba(45,212,191,0.35)',
  academyLabel: 'ADAPTIVE MOTOR LAB',
  planA: '#94A3B8',
  planB: '#F97316',
} as const;

export type PlanDirection = 'left' | 'right' | 'up' | 'down' | 'center';

export type PlanTarget = Point & {
  direction: PlanDirection;
  label: string;
  arrow: string;
  radius: number;
  color: string;
};

export type PlanChangeRound = {
  id: string;
  planA: PlanTarget;
  planB: PlanTarget;
  voicePlanA: string;
  voiceSwitch: string;
  voicePlanB: string;
  adaptCue: string;
};

export const CHANGE_THE_PLAN_THEME = {
  title: 'Change The Plan',
  subtitle: 'Follow the signal — then adapt fast when the plan switches! Move your body to the new target.',
  emoji: '🔀',
  hero: '🎯',
  accent: '#2DD4BF',
  accentCoral: '#FB7185',
  accentTeal: '#14B8A6',
  glow: 'rgba(45,212,191,0.5)',
  bgGradient: ['#0F172A', '#134E4A', '#7F1D1D', '#0D9488'] as [string, string, string, string],
  decor: ['🔀', '🎯', '↔️', '✨', '🧭', '💫', '🔁', '⚡'],
  hintText: 'Watch the plan — when it changes, redirect your body to the new signal!',
  positionCue: 'Face the camera so we can track your adaptive movement.',
  planLabel: 'PLAN A',
  switchLabel: 'PLAN CHANGED!',
  adaptLabel: 'ADAPT!',
  holdLabel: 'HOLD!',
  voiceIntro:
    'Welcome to the Shift Signal Bridge! Each round starts with Plan A — but the plan can change! Adapt quickly and move to the new target.',
  voiceComplete: 'Brilliant adapting! You changed your motor plan every time like a true signal captain!',
  congrats: 'Plan Adapter Pro!',
  skillTags: [
    'adaptive-responses',
    'motor-planning',
    'sensory-integration',
    'attention',
    'functional-participation',
  ],
} as const;

const tgt = (
  direction: PlanDirection,
  label: string,
  arrow: string,
  x: number,
  y: number,
  color: string,
): PlanTarget => ({
  direction,
  label,
  arrow,
  x,
  y,
  radius: 0.105,
  color,
});

export const PLAN_CHANGE_ROUNDS: PlanChangeRound[] = [
  {
    id: 'left-right',
    planA: tgt('left', 'Go Left', '←', 0.16, 0.5, SHIFT_SHELL.planA),
    planB: tgt('right', 'Go Right', '→', 0.84, 0.5, SHIFT_SHELL.planB),
    voicePlanA: 'Plan A: move LEFT toward the gray signal!',
    voiceSwitch: 'Plan changed! Go RIGHT now!',
    voicePlanB: 'New plan — move RIGHT to the coral signal!',
    adaptCue: 'Adapt right — reach the new signal!',
  },
  {
    id: 'up-down',
    planA: tgt('up', 'Go Up', '↑', 0.5, 0.18, SHIFT_SHELL.planA),
    planB: tgt('down', 'Go Down', '↓', 0.5, 0.78, SHIFT_SHELL.planB),
    voicePlanA: 'Plan A: reach UP to the top signal!',
    voiceSwitch: 'Switch! Plan B is DOWN!',
    voicePlanB: 'Adapt down — move to the lower signal!',
    adaptCue: 'Redirect down to the new target!',
  },
  {
    id: 'right-left',
    planA: tgt('right', 'Go Right', '→', 0.84, 0.42, SHIFT_SHELL.planA),
    planB: tgt('left', 'Go Left', '←', 0.16, 0.58, SHIFT_SHELL.planB),
    voicePlanA: 'Plan A: glide RIGHT to the signal!',
    voiceSwitch: 'Change! Now go LEFT!',
    voicePlanB: 'Adapt left — new plan active!',
    adaptCue: 'Quick — move left to adapt!',
  },
  {
    id: 'center-up',
    planA: tgt('center', 'Center', '◎', 0.5, 0.5, SHIFT_SHELL.planA),
    planB: tgt('up', 'Go Up', '↑', 0.5, 0.2, SHIFT_SHELL.planB),
    voicePlanA: 'Plan A: move to CENTER!',
    voiceSwitch: 'Plan flip — go UP instead!',
    voicePlanB: 'Adapt up to the top signal!',
    adaptCue: 'Leave center — reach up!',
  },
  {
    id: 'down-center',
    planA: tgt('down', 'Go Down', '↓', 0.5, 0.76, SHIFT_SHELL.planA),
    planB: tgt('center', 'Center', '◎', 0.5, 0.48, SHIFT_SHELL.planB),
    voicePlanA: 'Plan A: reach DOWN low!',
    voiceSwitch: 'Surprise switch — CENTER now!',
    voicePlanB: 'Adapt to center — new target!',
    adaptCue: 'Rise to center and hold!',
  },
];
