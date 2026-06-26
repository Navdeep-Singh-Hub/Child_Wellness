/**
 * OT Level 10 · Session 4 · Game 3 — Catch & Turn · "Whirlwind Catch Arena"
 *
 * Amber spark + indigo spin palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const CATCH_SHELL = {
  backText: '#FDE68A',
  backBorder: 'rgba(253,230,138,0.35)',
  statLabel: '#C4B5FD',
  statValue: '#FFFBEB',
  statBorder: 'rgba(196,181,253,0.45)',
  stageBorder: 'rgba(251,191,36,0.55)',
  stageBg: 'rgba(30,27,75,0.82)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#FBBF24',
  glassBorder: 'rgba(251,191,36,0.35)',
  academyLabel: 'CATCH TURN LAB',
  catch: '#F59E0B',
  turn: '#818CF8',
} as const;

export type CatchHand = 'left' | 'right';

export type CatchTurnRound = {
  id: string;
  hand: CatchHand;
  label: string;
  emoji: string;
  color: string;
  spawn: Point;
  catch: Point & { radius: number };
  turn: Point & { radius: number };
  voiceCatch: string;
  voiceTurn: string;
  turnCue: string;
};

export const CATCH_TURN_THEME = {
  title: 'Catch & Turn',
  subtitle: 'Catch the spinning orb with your hand — then turn your body to face the new direction!',
  emoji: '🌀',
  hero: '🤾',
  accent: '#FBBF24',
  accentIndigo: '#818CF8',
  glow: 'rgba(251,191,36,0.5)',
  bgGradient: ['#1E1B4B', '#312E81', '#78350F', '#4C1D95'] as [string, string, string, string],
  decor: ['🌀', '🤾', '⭐', '💫', '🔄', '✨', '🎯', '⚡'],
  hintText: 'Catch the flying orb — then turn to the spin marker and hold!',
  positionCue: 'Show your hands and upper body — we track catch and turn.',
  catchLabel: 'CATCH!',
  turnLabel: 'TURN!',
  holdCatchLabel: 'GOT IT!',
  holdTurnLabel: 'HOLD TURN!',
  voiceIntro:
    'Welcome to the Whirlwind Catch Arena! Each round an orb flies in — catch it with the right hand, then turn your body to the spin marker and hold steady.',
  voiceComplete: 'Amazing catches and turns! You integrated every whirlwind challenge like a champion!',
  congrats: 'Catch Turn Star!',
  skillTags: [
    'sensory-integration',
    'motor-planning',
    'adaptive-responses',
    'self-regulation',
    'functional-participation',
  ],
} as const;

const cr = (
  id: string,
  hand: CatchHand,
  label: string,
  emoji: string,
  color: string,
  spawn: Point,
  catchPt: Point,
  turnPt: Point,
  voiceCatch: string,
  voiceTurn: string,
  turnCue: string,
): CatchTurnRound => ({
  id,
  hand,
  label,
  emoji,
  color,
  spawn,
  catch: { ...catchPt, radius: 0.1 },
  turn: { ...turnPt, radius: 0.105 },
  voiceCatch,
  voiceTurn,
  turnCue,
});

export const CATCH_TURN_ROUNDS: CatchTurnRound[] = [
  cr(
    'left-turn-right',
    'left',
    'Left Catch',
    '⭐',
    '#FBBF24',
    { x: 0.82, y: 0.35 },
    { x: 0.24, y: 0.48 },
    { x: 0.78, y: 0.42 },
    'Catch with your LEFT hand — orb incoming!',
    'Caught! TURN right to the spin marker!',
    'Turn right — face the marker!',
  ),
  cr(
    'right-turn-left',
    'right',
    'Right Catch',
    '💫',
    '#818CF8',
    { x: 0.18, y: 0.4 },
    { x: 0.76, y: 0.5 },
    { x: 0.22, y: 0.44 },
    'Catch with your RIGHT hand!',
    'Nice catch! TURN left to the marker!',
    'Turn left — hold steady!',
  ),
  cr(
    'left-high-turn',
    'left',
    'Sky Catch',
    '🌟',
    '#F472B6',
    { x: 0.75, y: 0.18 },
    { x: 0.28, y: 0.28 },
    { x: 0.72, y: 0.62 },
    'Sky orb coming — LEFT hand catch up high!',
    'TURN down-right to the spin zone!',
    'Rotate to the lower marker!',
  ),
  cr(
    'right-low-turn',
    'right',
    'Low Catch',
    '🔥',
    '#FB923C',
    { x: 0.25, y: 0.72 },
    { x: 0.74, y: 0.68 },
    { x: 0.26, y: 0.3 },
    'Low orb — catch with RIGHT hand!',
    'TURN up-left to face the marker!',
    'Rise and turn — hold the spin!',
  ),
  cr(
    'left-final-turn',
    'left',
    'Whirl Catch',
    '🌀',
    '#A78BFA',
    { x: 0.85, y: 0.55 },
    { x: 0.35, y: 0.52 },
    { x: 0.8, y: 0.28 },
    'Final whirl — LEFT hand catch!',
    'TURN up-right — finish strong!',
    'Turn and hold — arena champion!',
  ),
];
