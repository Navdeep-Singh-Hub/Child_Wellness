/**
 * OT Level 10 · Session 8 · Game 5 — Problem Solver · "Solver Mastery Quest"
 *
 * Indigo + amber capstone palette.
 */

import type { Point } from '@/components/game/occupational/level6/session1/poseUtils';

export const SOLVER_SHELL = {
  backText: '#C7D2FE',
  backBorder: 'rgba(199,210,254,0.35)',
  statLabel: '#FDE68A',
  statValue: '#EEF2FF',
  statBorder: 'rgba(253,230,138,0.45)',
  stageBorder: 'rgba(99,102,241,0.55)',
  stageBg: 'rgba(15,23,42,0.82)',
  good: '#34D399',
  warn: '#FB7185',
  gold: '#FDE68A',
  sparkleColor: '#6366F1',
  glassBorder: 'rgba(99,102,241,0.35)',
  academyLabel: 'SOLVER MASTERY',
  try: '#14B8A6',
  adapt: '#F59E0B',
  solve: '#6366F1',
} as const;

export type SolverPhaseKind = 'try' | 'adapt' | 'solve';

export type ProblemSolverRound = {
  id: string;
  title: string;
  emoji: string;
  color: string;
  try: Point & { radius: number };
  adapt: Point & { radius: number };
  solve: Point & { radius: number };
  voiceTry: string;
  voiceAdapt: string;
  voiceSolve: string;
  adaptCue: string;
  solveCue: string;
};

export const PROBLEM_SOLVER_THEME = {
  title: 'Problem Solver',
  subtitle: 'Try, adapt, then solve each challenge — the ultimate sensory problem-solving adventure!',
  emoji: '🧩',
  hero: '💡',
  accent: '#6366F1',
  accentGold: '#FBBF24',
  glow: 'rgba(99,102,241,0.5)',
  bgGradient: ['#0F172A', '#312E81', '#713F12', '#1E1B4B'] as [string, string, string, string],
  decor: ['🧩', '💡', '🔧', '🗝️', '🏃', '🦸', '✨', '🌟'],
  hintText: 'Three solver steps: try the challenge, adapt with calm body, then solve the finale!',
  positionCue: 'Face the camera — we track your problem-solving adventure.',
  tryLabel: 'TRY!',
  adaptLabel: 'ADAPT!',
  solveLabel: 'SOLVE!',
  holdTryLabel: 'TRY NODE!',
  holdAdaptLabel: 'ADAPT HOLD!',
  holdSolveLabel: 'SOLVED!',
  voiceIntro:
    'Welcome to Problem Solver! This is the ultimate sensory problem-solving adventure. Try each challenge, adapt with calm stillness, then solve the finale with steady attention.',
  voiceComplete: 'Problem Solver champion! You completed every try, adapt and solve challenge!',
  congrats: 'Problem Solver Champion!',
  skillTags: [
    'sensory-integration',
    'self-regulation',
    'adaptive-responses',
    'motor-planning',
    'functional-participation',
  ],
} as const;

const ps = (
  id: string,
  title: string,
  emoji: string,
  color: string,
  tryPt: Point,
  adapt: Point,
  solve: Point,
  voiceTry: string,
  voiceAdapt: string,
  voiceSolve: string,
  adaptCue: string,
  solveCue: string,
): ProblemSolverRound => ({
  id,
  title,
  emoji,
  color,
  try: { ...tryPt, radius: 0.1 },
  adapt: { ...adapt, radius: 0.1 },
  solve: { ...solve, radius: 0.095 },
  voiceTry,
  voiceAdapt,
  voiceSolve,
  adaptCue,
  solveCue,
});

export const PROBLEM_SOLVER_ROUNDS: ProblemSolverRound[] = [
  ps(
    'gate',
    'Try Gate',
    '🧩',
    '#14B8A6',
    { x: 0.24, y: 0.4 },
    { x: 0.5, y: 0.48 },
    { x: 0.5, y: 0.52 },
    'Step 1: TRY — go to the puzzle gate on the left!',
    'Step 2: ADAPT — adjust with calm body!',
    'Step 3: SOLVE — lock in your solution!',
    'Calm body — adapt hold!',
    'Try gate solved!',
  ),
  ps(
    'path',
    'Path Puzzle',
    '🗝️',
    '#22C55E',
    { x: 0.76, y: 0.38 },
    { x: 0.48, y: 0.5 },
    { x: 0.52, y: 0.46 },
    'TRY right — reach the path puzzle!',
    'ADAPT — steady body on the path!',
    'SOLVE — complete the path puzzle!',
    'Path adapt — hold steady!',
    'Path puzzle solved!',
  ),
  ps(
    'route',
    'Route Riddle',
    '🏃',
    '#8B5CF6',
    { x: 0.5, y: 0.22 },
    { x: 0.5, y: 0.48 },
    { x: 0.5, y: 0.5 },
    'TRY up — reach the route riddle!',
    'ADAPT — pause and adjust!',
    'SOLVE the route riddle!',
    'Route calm — hold!',
    'Route riddle solved!',
  ),
  ps(
    'rescue',
    'Rescue Puzzle',
    '🦸',
    '#EF4444',
    { x: 0.28, y: 0.64 },
    { x: 0.5, y: 0.46 },
    { x: 0.48, y: 0.52 },
    'TRY — go to the rescue puzzle!',
    'ADAPT — observe with calm stillness!',
    'SOLVE the rescue puzzle!',
    'Rescue adapt — quiet body!',
    'Rescue puzzle solved!',
  ),
  ps(
    'crown',
    'Solver Crown',
    '💡',
    '#FBBF24',
    { x: 0.72, y: 0.66 },
    { x: 0.5, y: 0.5 },
    { x: 0.5, y: 0.48 },
    'Final TRY — reach the solver crown!',
    'ADAPT — calm before solving!',
    'PROBLEM SOLVER finale — champion solve!',
    'Crown adapt — almost there!',
    'You are a Problem Solver!',
  ),
];
