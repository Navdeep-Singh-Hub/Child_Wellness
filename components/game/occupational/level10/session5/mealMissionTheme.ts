/**
 * OT Level 10 · Session 5 · Game 3 — Meal Mission · "Kitchen Adventure"
 *
 * Tomato red + cream kitchen palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const MEAL_SHELL = {
  backText: '#FECACA',
  backBorder: 'rgba(254,202,202,0.35)',
  statLabel: '#86EFAC',
  statValue: '#FFF7ED',
  statBorder: 'rgba(134,239,172,0.45)',
  stageBorder: 'rgba(249,115,22,0.55)',
  stageBg: 'rgba(28,25,23,0.84)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#F97316',
  glassBorder: 'rgba(249,115,22,0.35)',
  academyLabel: 'DAILY SKILLS LAB',
  prepare: '#A8A29E',
  ready: '#22C55E',
} as const;

export type MealStation = 'fridge' | 'prep' | 'mix' | 'plate' | 'cleanup';

export type MealMissionRound = {
  id: string;
  station: MealStation;
  label: string;
  emoji: string;
  color: string;
  prepare: Point & { radius: number };
  ready: Point & { radius: number };
  voicePrepare: string;
  voiceReady: string;
  readyCue: string;
};

export const MEAL_MISSION_THEME = {
  title: 'Meal Mission',
  subtitle: 'Complete the kitchen meal routine — prepare at each station, then hold your meal-ready stance!',
  emoji: '🍳',
  hero: '👨‍🍳',
  accent: '#F97316',
  accentTomato: '#EF4444',
  glow: 'rgba(249,115,22,0.5)',
  bgGradient: ['#1C1917', '#7C2D12', '#9A3412', '#365314'] as [string, string, string, string],
  decor: ['🍳', '🥗', '🍽️', '🥣', '🧊', '🧽', '🍎', '⭐'],
  hintText: 'Move to each kitchen station — then hold your meal-ready stance with tall posture!',
  positionCue: 'Face the camera so we can track your meal routine movement.',
  prepareLabel: 'PREPARE!',
  readyLabel: 'MEAL READY!',
  holdPrepareLabel: 'STATION!',
  holdReadyLabel: 'DONE HOLD!',
  voiceIntro:
    'Welcome to Meal Mission! Each round you prepare at a kitchen station — then hold your meal-ready stance with good posture and attention.',
  voiceComplete: 'Delicious work! You finished every meal routine like a daily skills chef!',
  congrats: 'Meal Mission Star!',
  skillTags: [
    'functional-participation',
    'motor-planning',
    'sensory-integration',
    'self-regulation',
    'adaptive-responses',
  ],
} as const;

const mr = (
  id: string,
  station: MealStation,
  label: string,
  emoji: string,
  color: string,
  prepare: Point,
  ready: Point,
  voicePrepare: string,
  voiceReady: string,
  readyCue: string,
): MealMissionRound => ({
  id,
  station,
  label,
  emoji,
  color,
  prepare: { ...prepare, radius: 0.105 },
  ready: { ...ready, radius: 0.1 },
  voicePrepare,
  voiceReady,
  readyCue,
});

export const MEAL_MISSION_ROUNDS: MealMissionRound[] = [
  mr(
    'fridge',
    'fridge',
    'Fridge',
    '🧊',
    '#38BDF8',
    { x: 0.22, y: 0.38 },
    { x: 0.5, y: 0.48 },
    'Prepare: go to the FRIDGE on the left!',
    'Meal ready! Stand tall — ingredients gathered!',
    'Fridge done — steady and tall!',
  ),
  mr(
    'prep',
    'prep',
    'Prep Counter',
    '🔪',
    '#F97316',
    { x: 0.5, y: 0.26 },
    { x: 0.5, y: 0.5 },
    'Prepare: move to the PREP counter!',
    'Hold meal ready — food prepped!',
    'Prep complete — calm attention!',
  ),
  mr(
    'mix',
    'mix',
    'Mixing Bowl',
    '🥣',
    '#FBBF24',
    { x: 0.76, y: 0.42 },
    { x: 0.48, y: 0.52 },
    'Prepare: go RIGHT to the mixing bowl!',
    'Meal ready! Hold — stirring done!',
    'Mixed well — still body!',
  ),
  mr(
    'plate',
    'plate',
    'Plate Station',
    '🍽️',
    '#EF4444',
    { x: 0.28, y: 0.64 },
    { x: 0.52, y: 0.46 },
    'Prepare: walk to the PLATE station!',
    'Hold meal ready — plate served!',
    'Plated up — great helper chef!',
  ),
  mr(
    'cleanup',
    'cleanup',
    'Clean-Up Sink',
    '🧽',
    '#84CC16',
    { x: 0.72, y: 0.68 },
    { x: 0.5, y: 0.5 },
    'Final step — go to the CLEAN-UP sink!',
    'Meal ready! Hold — kitchen clean!',
    'Mission complete — superstar chef!',
  ),
];
