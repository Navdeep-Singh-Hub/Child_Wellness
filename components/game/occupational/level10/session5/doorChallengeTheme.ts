/**
 * OT Level 10 · Session 5 · Game 4 — Door Challenge · "Transition Trail"
 *
 * Slate blue + warm wood entryway palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const DOOR_SHELL = {
  backText: '#CBD5E1',
  backBorder: 'rgba(203,213,225,0.35)',
  statLabel: '#86EFAC',
  statValue: '#F8FAFC',
  statBorder: 'rgba(134,239,172,0.45)',
  stageBorder: 'rgba(100,116,139,0.55)',
  stageBg: 'rgba(15,23,42,0.86)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#64748B',
  glassBorder: 'rgba(148,163,184,0.35)',
  academyLabel: 'DAILY SKILLS LAB',
  prepare: '#94A3B8',
  ready: '#22C55E',
} as const;

export type DoorType = 'front' | 'bedroom' | 'bathroom' | 'classroom' | 'car';

export type DoorChallengeRound = {
  id: string;
  door: DoorType;
  label: string;
  emoji: string;
  color: string;
  prepare: Point & { radius: number };
  ready: Point & { radius: number };
  voicePrepare: string;
  voiceReady: string;
  readyCue: string;
};

export const DOOR_CHALLENGE_THEME = {
  title: 'Door Challenge',
  subtitle: 'Practice door transitions — prepare at each doorway, then hold your transition-ready stance!',
  emoji: '🚪',
  hero: '🗝️',
  accent: '#64748B',
  accentWood: '#92400E',
  glow: 'rgba(100,116,139,0.5)',
  bgGradient: ['#0F172A', '#334155', '#78350F', '#1E3A5F'] as [string, string, string, string],
  decor: ['🚪', '🗝️', '🏠', '🛏️', '🚿', '🏫', '🚗', '⭐'],
  hintText: 'Move to each doorway station — then hold your transition-ready stance with tall posture!',
  positionCue: 'Face the camera so we can track your door transition movement.',
  prepareLabel: 'APPROACH!',
  readyLabel: 'DOOR READY!',
  holdPrepareLabel: 'AT DOOR!',
  holdReadyLabel: 'TRANSITION HOLD!',
  voiceIntro:
    'Welcome to the Door Challenge! Each round you approach a doorway station — then hold your transition-ready stance with good posture and attention.',
  voiceComplete: 'Amazing transitions! You mastered every doorway like a daily skills champion!',
  congrats: 'Door Challenge Star!',
  skillTags: [
    'functional-participation',
    'motor-planning',
    'sensory-integration',
    'self-regulation',
    'adaptive-responses',
  ],
} as const;

const dr = (
  id: string,
  door: DoorType,
  label: string,
  emoji: string,
  color: string,
  prepare: Point,
  ready: Point,
  voicePrepare: string,
  voiceReady: string,
  readyCue: string,
): DoorChallengeRound => ({
  id,
  door,
  label,
  emoji,
  color,
  prepare: { ...prepare, radius: 0.105 },
  ready: { ...ready, radius: 0.1 },
  voicePrepare,
  voiceReady,
  readyCue,
});

export const DOOR_CHALLENGE_ROUNDS: DoorChallengeRound[] = [
  dr(
    'front',
    'front',
    'Front Door',
    '🚪',
    '#64748B',
    { x: 0.22, y: 0.4 },
    { x: 0.5, y: 0.48 },
    'Approach: go to the FRONT door on the left!',
    'Door ready! Stand tall — ready to go out!',
    'Front door ready — calm and tall!',
  ),
  dr(
    'bedroom',
    'bedroom',
    'Bedroom Door',
    '🛏️',
    '#A78BFA',
    { x: 0.78, y: 0.38 },
    { x: 0.5, y: 0.52 },
    'Approach: move RIGHT to the bedroom door!',
    'Hold transition ready — bedroom entered!',
    'Bedroom door — steady body!',
  ),
  dr(
    'bathroom',
    'bathroom',
    'Bathroom Door',
    '🚿',
    '#38BDF8',
    { x: 0.5, y: 0.24 },
    { x: 0.48, y: 0.5 },
    'Approach: go UP to the bathroom door!',
    'Door ready! Hold with calm attention!',
    'Bathroom ready — still and focused!',
  ),
  dr(
    'classroom',
    'classroom',
    'Classroom Door',
    '🏫',
    '#FBBF24',
    { x: 0.28, y: 0.62 },
    { x: 0.5, y: 0.46 },
    'Approach: walk to the CLASSROOM door!',
    'Hold ready — quiet body at the door!',
    'Classroom door — line-up ready!',
  ),
  dr(
    'car',
    'car',
    'Car Door',
    '🚗',
    '#22C55E',
    { x: 0.72, y: 0.66 },
    { x: 0.5, y: 0.5 },
    'Final door — go to the CAR door!',
    'Door ready! Hold for the car!',
    'Car door ready — great transitions!',
  ),
];
