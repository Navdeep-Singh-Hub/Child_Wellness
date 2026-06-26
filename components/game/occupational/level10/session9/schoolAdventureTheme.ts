/**
 * OT Level 10 · Session 9 · Game 1 — School Adventure · "Campus Quest"
 *
 * Sky blue + golden school palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const SCHOOL_SHELL = {
  backText: '#BAE6FD',
  backBorder: 'rgba(186,230,253,0.35)',
  statLabel: '#FDE68A',
  statValue: '#F0F9FF',
  statBorder: 'rgba(253,230,138,0.45)',
  stageBorder: 'rgba(56,189,248,0.55)',
  stageBg: 'rgba(15,23,42,0.84)',
  good: '#38BDF8',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#0EA5E9',
  glassBorder: 'rgba(56,189,248,0.35)',
  academyLabel: 'REAL-LIFE LAB',
  enter: '#94A3B8',
  participate: '#FBBF24',
} as const;

export type SchoolSpot = 'bus' | 'hall' | 'classroom' | 'lunch' | 'playground';

export type SchoolAdventureRound = {
  id: string;
  spot: SchoolSpot;
  label: string;
  emoji: string;
  color: string;
  enter: Point & { radius: number };
  participate: Point & { radius: number };
  voiceEnter: string;
  voiceParticipate: string;
  participateCue: string;
};

export const SCHOOL_ADVENTURE_THEME = {
  title: 'School Adventure',
  subtitle: 'Enter each school zone — then participate with calm posture, attention and a steady hold!',
  emoji: '🏫',
  hero: '📚',
  accent: '#0EA5E9',
  accentGold: '#FBBF24',
  glow: 'rgba(14,165,233,0.5)',
  bgGradient: ['#0F172A', '#0C4A6E', '#713F12', '#1E3A8A'] as [string, string, string, string],
  decor: ['🏫', '📚', '🚌', '🍎', '🛝', '✏️', '🔔', '⭐'],
  hintText: 'Enter each school spot — then participate with steady body and attention!',
  positionCue: 'Face the camera so we can track your school adventure.',
  enterLabel: 'ENTER ZONE!',
  participateLabel: 'PARTICIPATE!',
  holdEnterLabel: 'ZONE ENTERED!',
  holdParticipateLabel: 'GREAT PARTICIPATION!',
  voiceIntro:
    'Welcome to School Adventure! Each round you enter a school zone — then participate with calm posture and steady attention.',
  voiceComplete: 'School adventure complete! You participated in every zone like a real-life sensory champion!',
  congrats: 'School Adventure Star!',
  skillTags: [
    'sensory-integration',
    'self-regulation',
    'adaptive-responses',
    'motor-planning',
    'functional-participation',
  ],
} as const;

const sa = (
  id: string,
  spot: SchoolSpot,
  label: string,
  emoji: string,
  color: string,
  enter: Point,
  participate: Point,
  voiceEnter: string,
  voiceParticipate: string,
  participateCue: string,
): SchoolAdventureRound => ({
  id,
  spot,
  label,
  emoji,
  color,
  enter: { ...enter, radius: 0.105 },
  participate: { ...participate, radius: 0.1 },
  voiceEnter,
  voiceParticipate,
  participateCue,
});

export const SCHOOL_ADVENTURE_ROUNDS: SchoolAdventureRound[] = [
  sa(
    'bus',
    'bus',
    'Bus Stop',
    '🚌',
    '#38BDF8',
    { x: 0.25, y: 0.4 },
    { x: 0.5, y: 0.5 },
    'ENTER LEFT — go to the bus stop!',
    'PARTICIPATE hold! Join the bus line!',
    'Bus stop — great participation!',
  ),
  sa(
    'hall',
    'hall',
    'School Hall',
    '🏫',
    '#6366F1',
    { x: 0.75, y: 0.36 },
    { x: 0.48, y: 0.52 },
    'ENTER RIGHT — reach the school hall!',
    'PARTICIPATE hold! Steady in the hallway!',
    'Hallway joined — wonderful focus!',
  ),
  sa(
    'classroom',
    'classroom',
    'Classroom',
    '📚',
    '#22C55E',
    { x: 0.5, y: 0.22 },
    { x: 0.5, y: 0.48 },
    'Look UP — enter the classroom!',
    'PARTICIPATE hold! Join class calmly!',
    'Classroom ready — smart participation!',
  ),
  sa(
    'lunch',
    'lunch',
    'Lunch Line',
    '🍎',
    '#F97316',
    { x: 0.3, y: 0.65 },
    { x: 0.5, y: 0.46 },
    'ENTER the lunch line below!',
    'PARTICIPATE hold! Calm lunch routine!',
    'Lunch line — steady body!',
  ),
  sa(
    'playground',
    'playground',
    'Playground',
    '🛝',
    '#FBBF24',
    { x: 0.7, y: 0.64 },
    { x: 0.5, y: 0.5 },
    'Final zone — enter the playground!',
    'PARTICIPATE hold! Champion school star!',
    'Playground fun — adventure complete!',
  ),
];
