/**
 * OT Level 8 · Session 8 — Movement Problem Solving.
 *
 * Each round is a movement puzzle: a clue describes the problem and the child
 * must figure out which body move solves it (from 3 options). evalPuzzleMove()
 * reuses the Level 8 movement primitive evaluators.
 */
import type { PostureBaseline, PostureMetrics } from '@/components/game/occupational/level6/session1/poseUtils';
import {
  DEFAULT_THRESHOLDS,
  evaluateAction,
  makeStep,
} from '@/components/game/occupational/level8/motorActions';
import { evalBilateral, type BilateralPattern } from '@/components/game/occupational/level8/session7/bilateralPlan';
import { evalPosition, type PositionSpec } from '@/components/game/occupational/level8/session5/bodyPosition';
import { SESSION5_THRESHOLDS } from '@/components/game/occupational/level8/session5/session5Pacing';
import { SESSION7_THRESHOLDS } from '@/components/game/occupational/level8/session7/session7Pacing';

export type PuzzleMoveKind =
  | 'reachHigh'
  | 'reachLow'
  | 'reachSideLeft'
  | 'reachSideRight'
  | 'turn'
  | 'jump'
  | 'clap'
  | 'freeze'
  | 'launch'
  | 'bothUp'
  | 'bothOut'
  | 'crossClap'
  | 'bear';

export type PuzzleMove = {
  id: string;
  label: string;
  icon: string;
  kind: PuzzleMoveKind;
};

export type PuzzleRound = {
  id: string;
  clue: string;
  prompt: string;
  correct: PuzzleMove;
  options: PuzzleMove[];
};

export type PuzzleEval = {
  ok: boolean;
  score: number;
  holdMs: number;
  transient: boolean;
};

export type PuzzleThresholds = {
  solveHoldMs: number;
};

export const DEFAULT_PUZZLE_THRESHOLDS: PuzzleThresholds = {
  solveHoldMs: 650,
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
};

/** Build a round with shuffled answer choices (correct + 2 distractors). */
export function buildPuzzleRound(
  id: string,
  clue: string,
  prompt: string,
  correct: PuzzleMove,
  distractors: PuzzleMove[],
): PuzzleRound {
  const opts = shuffle([correct, ...distractors.slice(0, 2)]);
  return { id, clue, prompt, correct, options: opts };
}

const posFor = (kind: PuzzleMoveKind): PositionSpec | null => {
  switch (kind) {
    case 'reachHigh':
      return { id: 'ph', kind: 'reachHigh', name: 'Reach High', icon: '⬆️', hands: 2 };
    case 'reachLow':
      return { id: 'pl', kind: 'reachLow', name: 'Reach Low', icon: '⬇️', hands: 2 };
    case 'reachSideLeft':
      return { id: 'sl', kind: 'reachSide', name: 'Reach Left', icon: '⬅️', side: 'left' };
    case 'reachSideRight':
      return { id: 'sr', kind: 'reachSide', name: 'Reach Right', icon: '➡️', side: 'right' };
    case 'turn':
      return { id: 'tn', kind: 'turn', name: 'Turn', icon: '🌀', side: 'left' };
    default:
      return null;
  }
};

const bilateralFor = (kind: PuzzleMoveKind): BilateralPattern | null => {
  switch (kind) {
    case 'bothUp':
      return { id: 'bu', name: 'Both Up', icon: '🙌', kind: 'zones', leftArm: 'up', rightArm: 'up' };
    case 'bothOut':
      return { id: 'bo', name: 'Both Out', icon: '🦅', kind: 'zones', leftArm: 'out', rightArm: 'out' };
    case 'crossClap':
      return { id: 'cc', name: 'Cross Clap', icon: '✖️', kind: 'crossClap' };
    case 'bear':
      return { id: 'br', name: 'Bear', icon: '🐻', kind: 'bear' };
    default:
      return null;
  }
};

/** Score how well the child is performing one puzzle move option. */
export function evalPuzzleMove(
  move: PuzzleMove,
  m: PostureMetrics,
  prev: PostureMetrics | null,
  base: PostureBaseline,
  th: PuzzleThresholds = DEFAULT_PUZZLE_THRESHOLDS,
): PuzzleEval {
  const hold = th.solveHoldMs;
  if (!m.present) return { ok: false, score: 0, holdMs: hold, transient: false };

  const pos = posFor(move.kind);
  if (pos) {
    const ev = evalPosition(m, base, pos, { ...SESSION5_THRESHOLDS, positionHoldMs: hold });
    return { ok: ev.ok, score: ev.score, holdMs: ev.holdMs, transient: false };
  }

  const bil = bilateralFor(move.kind);
  if (bil) {
    const ev = evalBilateral(bil, m, prev, base, SESSION7_THRESHOLDS);
    return { ok: ev.ok, score: ev.score, holdMs: ev.holdMs, transient: ev.transient };
  }

  const actionMap: Partial<Record<PuzzleMoveKind, 'jump' | 'clap' | 'freeze' | 'launch' | 'turn'>> = {
    jump: 'jump',
    clap: 'clap',
    freeze: 'freeze',
    launch: 'launch',
    turn: 'turn',
  };
  const ak = actionMap[move.kind];
  if (ak) {
    const step = makeStep(ak);
    const ev = evaluateAction(step, m, prev, base, null, DEFAULT_THRESHOLDS);
    return {
      ok: ev.ok,
      score: ev.approach,
      holdMs: ev.transient ? 0 : ev.holdMs || hold,
      transient: ev.transient,
    };
  }

  return { ok: false, score: 0, holdMs: hold, transient: false };
}

/** Find which option (if any) the child is currently performing strongly. */
export function bestMatchingOption(
  options: PuzzleMove[],
  m: PostureMetrics,
  prev: PostureMetrics | null,
  base: PostureBaseline,
  th?: PuzzleThresholds,
): { move: PuzzleMove; ev: PuzzleEval } | null {
  let best: { move: PuzzleMove; ev: PuzzleEval } | null = null;
  for (const move of options) {
    const ev = evalPuzzleMove(move, m, prev, base, th);
    if (!best || ev.score > best.ev.score) best = { move, ev };
  }
  return best;
}
