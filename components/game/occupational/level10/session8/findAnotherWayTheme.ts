/**
 * OT Level 10 · Session 8 · Game 1 — Find Another Way · "Adaptive Path Quest"
 *
 * Teal + amber problem-solving palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const FIND_SHELL = {
  backText: '#99F6E4',
  backBorder: 'rgba(153,246,228,0.35)',
  statLabel: '#FDE68A',
  statValue: '#F0FDFA',
  statBorder: 'rgba(253,230,138,0.45)',
  stageBorder: 'rgba(20,184,166,0.55)',
  stageBg: 'rgba(15,23,42,0.84)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#14B8A6',
  glassBorder: 'rgba(20,184,166,0.35)',
  academyLabel: 'PROBLEM SOLVE LAB',
  try: '#94A3B8',
  adapt: '#F59E0B',
} as const;

export type PathChallenge = 'wall' | 'bridge' | 'maze' | 'gate' | 'puzzle';

export type FindAnotherWayRound = {
  id: string;
  challenge: PathChallenge;
  label: string;
  emoji: string;
  color: string;
  try: Point & { radius: number };
  adapt: Point & { radius: number };
  voiceTry: string;
  voiceAdapt: string;
  adaptCue: string;
};

export const FIND_ANOTHER_WAY_THEME = {
  title: 'Find Another Way',
  subtitle: 'Try each blocked path — then adapt and find another way with calm posture, attention and a steady hold!',
  emoji: '🧩',
  hero: '💡',
  accent: '#14B8A6',
  accentAmber: '#F59E0B',
  glow: 'rgba(20,184,166,0.5)',
  bgGradient: ['#0F172A', '#134E4A', '#78350F', '#1E3A8A'] as [string, string, string, string],
  decor: ['🧩', '💡', '🚧', '🌉', '🗺️', '🔑', '⚡', '🛤️'],
  hintText: 'Try the first path — then adapt and find another way with steady body and attention!',
  positionCue: 'Face the camera so we can track your problem-solving adventure.',
  tryLabel: 'TRY PATH!',
  adaptLabel: 'ADAPT!',
  holdTryLabel: 'TRY IT!',
  holdAdaptLabel: 'ADAPT HOLD!',
  voiceIntro:
    'Welcome to Find Another Way! Each round you try a path — then adapt and find another way with calm posture and steady attention.',
  voiceComplete: 'Brilliant adapting! You found another way on every challenge like a problem-solving champion!',
  congrats: 'Find Another Way Star!',
  skillTags: [
    'sensory-integration',
    'self-regulation',
    'adaptive-responses',
    'motor-planning',
    'functional-participation',
  ],
} as const;

const fa = (
  id: string,
  challenge: PathChallenge,
  label: string,
  emoji: string,
  color: string,
  tryPt: Point,
  adapt: Point,
  voiceTry: string,
  voiceAdapt: string,
  adaptCue: string,
): FindAnotherWayRound => ({
  id,
  challenge,
  label,
  emoji,
  color,
  try: { ...tryPt, radius: 0.105 },
  adapt: { ...adapt, radius: 0.1 },
  voiceTry,
  voiceAdapt,
  adaptCue,
});

export const FIND_ANOTHER_WAY_ROUNDS: FindAnotherWayRound[] = [
  fa(
    'wall',
    'wall',
    'Wall Path',
    '🚧',
    '#EF4444',
    { x: 0.24, y: 0.4 },
    { x: 0.5, y: 0.48 },
    'TRY LEFT — go to the wall path!',
    'ADAPT hold! Find another way around!',
    'Wall adapted — clever path!',
  ),
  fa(
    'bridge',
    'bridge',
    'Bridge Gap',
    '🌉',
    '#38BDF8',
    { x: 0.76, y: 0.36 },
    { x: 0.5, y: 0.52 },
    'TRY RIGHT — reach the bridge gap!',
    'ADAPT hold! Steady new route!',
    'Bridge solved — great adapt!',
  ),
  fa(
    'maze',
    'maze',
    'Maze Turn',
    '🗺️',
    '#A78BFA',
    { x: 0.5, y: 0.22 },
    { x: 0.48, y: 0.5 },
    'Look UP — try the maze turn!',
    'ADAPT hold! New maze path!',
    'Maze mastered — smart adapt!',
  ),
  fa(
    'gate',
    'gate',
    'Locked Gate',
    '🔑',
    '#FBBF24',
    { x: 0.3, y: 0.64 },
    { x: 0.5, y: 0.46 },
    'TRY the locked gate below!',
    'ADAPT hold! Find the key path!',
    'Gate unlocked — wonderful focus!',
  ),
  fa(
    'puzzle',
    'puzzle',
    'Puzzle Finish',
    '🧩',
    '#14B8A6',
    { x: 0.7, y: 0.66 },
    { x: 0.5, y: 0.5 },
    'Final try — reach the puzzle path!',
    'ADAPT hold! Champion problem solver!',
    'Puzzle complete — adventure done!',
  ),
];
