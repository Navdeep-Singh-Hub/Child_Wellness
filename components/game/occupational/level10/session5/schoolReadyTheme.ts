/**
 * OT Level 10 · Session 5 · Game 1 — School Ready · "Morning School Run"
 *
 * Sky blue + apple red school palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const SCHOOL_SHELL = {
  backText: '#BAE6FD',
  backBorder: 'rgba(186,230,253,0.35)',
  statLabel: '#86EFAC',
  statValue: '#F0F9FF',
  statBorder: 'rgba(134,239,172,0.45)',
  stageBorder: 'rgba(56,189,248,0.55)',
  stageBg: 'rgba(15,23,42,0.8)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#38BDF8',
  glassBorder: 'rgba(56,189,248,0.35)',
  academyLabel: 'DAILY SKILLS LAB',
  prepare: '#94A3B8',
  ready: '#22C55E',
} as const;

export type SchoolStation = 'backpack' | 'cubby' | 'coat' | 'lineup' | 'bus';

export type SchoolReadyRound = {
  id: string;
  station: SchoolStation;
  label: string;
  emoji: string;
  color: string;
  prepare: Point & { radius: number };
  ready: Point & { radius: number };
  voicePrepare: string;
  voiceReady: string;
  readyCue: string;
};

export const SCHOOL_READY_THEME = {
  title: 'School Ready',
  subtitle: 'Practice the morning school routine — prepare at each station, then hold your school-ready stance!',
  emoji: '🎒',
  hero: '🏫',
  accent: '#38BDF8',
  accentApple: '#EF4444',
  glow: 'rgba(56,189,248,0.5)',
  bgGradient: ['#0F172A', '#0C4A6E', '#7F1D1D', '#14532D'] as [string, string, string, string],
  decor: ['🎒', '🏫', '📚', '🚌', '✏️', '🍎', '🧥', '⭐'],
  hintText: 'Move to each school station — then hold your ready stance with tall posture!',
  positionCue: 'Face the camera so we can track your school routine movement.',
  prepareLabel: 'PREPARE!',
  readyLabel: 'SCHOOL READY!',
  holdPrepareLabel: 'STATION!',
  holdReadyLabel: 'READY HOLD!',
  voiceIntro:
    'Good morning! Welcome to the Morning School Run. Each round you prepare at a school station — then hold your school-ready stance with good posture and attention.',
  voiceComplete: 'You are school ready! You practiced every morning routine like a daily skills champion!',
  congrats: 'School Ready Star!',
  skillTags: [
    'functional-participation',
    'motor-planning',
    'sensory-integration',
    'self-regulation',
    'adaptive-responses',
  ],
} as const;

const sr = (
  id: string,
  station: SchoolStation,
  label: string,
  emoji: string,
  color: string,
  prepare: Point,
  ready: Point,
  voicePrepare: string,
  voiceReady: string,
  readyCue: string,
): SchoolReadyRound => ({
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

export const SCHOOL_READY_ROUNDS: SchoolReadyRound[] = [
  sr(
    'backpack',
    'backpack',
    'Backpack Hook',
    '🎒',
    '#38BDF8',
    { x: 0.22, y: 0.42 },
    { x: 0.5, y: 0.48 },
    'Prepare: go to the BACKPACK hook on the left!',
    'School ready! Stand tall at the ready spot!',
    'Tall posture — backpack ready!',
  ),
  sr(
    'cubby',
    'cubby',
    'Lunch Cubby',
    '🍎',
    '#EF4444',
    { x: 0.78, y: 0.4 },
    { x: 0.5, y: 0.52 },
    'Prepare: move RIGHT to the lunch cubby!',
    'Hold your school-ready stance — lunch packed!',
    'Stand steady — cubby ready!',
  ),
  sr(
    'coat',
    'coat',
    'Coat Hook',
    '🧥',
    '#A78BFA',
    { x: 0.5, y: 0.22 },
    { x: 0.48, y: 0.5 },
    'Prepare: reach UP to the coat hook!',
    'School ready! Hold with calm attention!',
    'Coat on — ready to learn!',
  ),
  sr(
    'lineup',
    'lineup',
    'Line-Up Spot',
    '👟',
    '#22C55E',
    { x: 0.28, y: 0.62 },
    { x: 0.5, y: 0.46 },
    'Prepare: walk to the LINE-UP spot!',
    'Hold ready — quiet body in line!',
    'Line-up ready — still and tall!',
  ),
  sr(
    'bus',
    'bus',
    'Bus Stop',
    '🚌',
    '#FBBF24',
    { x: 0.72, y: 0.68 },
    { x: 0.5, y: 0.5 },
    'Final station — go to the BUS stop!',
    'School ready! Hold for the bus!',
    'Bus stop ready — great morning!',
  ),
];
