/**
 * OT Level 8 · Session 10 — Praxis Adventure (grand finale).
 *
 * Integrated expedition beats combining every praxis skill from Sessions 1–9.
 * evalBeatStep() dispatches to the shared Level 8 movement evaluators.
 */
import type { PostureBaseline, PostureMetrics } from '@/components/game/occupational/level6/session1/poseUtils';
import type { ArmZone } from '@/components/game/occupational/level8/session4/poseMatch';
import { evalNovel, type NovelEvalKind } from '@/components/game/occupational/level8/session9/novelChallenge';
import { evalBilateral, type BilateralPattern } from '@/components/game/occupational/level8/session7/bilateralPlan';
import {
  evalPuzzleMove,
  type PuzzleMove,
  type PuzzleEval,
} from '@/components/game/occupational/level8/session8/puzzleSolve';
import { pathAnchors, type ObstacleGate } from '@/components/game/occupational/level8/session6/obstacleNav';
import type { Anchor } from '@/components/game/occupational/level8/motorActions';

export type BeatEval =
  | { type: 'move'; move: PuzzleMove }
  | { type: 'two'; a: PuzzleMove; b: PuzzleMove }
  | { type: 'chain'; moves: PuzzleMove[] }
  | { type: 'imitate'; left: ArmZone; right: ArmZone }
  | { type: 'novel'; kind: NovelEvalKind };

export type PraxisBeat = {
  id: string;
  name: string;
  icon: string;
  eval: BeatEval;
};

export type BeatStepEval = PuzzleEval;

export type AdventureThresholds = {
  stepHoldMs: number;
};

export const DEFAULT_ADVENTURE_THRESHOLDS: AdventureThresholds = {
  stepHoldMs: 620,
};

/** How many pose-detected steps this beat needs. */
export function beatStepCount(beat: PraxisBeat): number {
  switch (beat.eval.type) {
    case 'two':
      return 2;
    case 'chain':
      return beat.eval.moves.length;
    default:
      return 1;
  }
}

/** Trail markers for overlay (one per beat). */
export function beatsToTrail(beats: PraxisBeat[]): ObstacleGate[] {
  const anchors = pathAnchors(beats.length);
  return beats.map((b, i) => ({
    id: b.id,
    kind: 'step' as const,
    name: b.name,
    icon: b.icon,
    anchor: anchors[i]!,
  }));
}

/** Evaluate the active step within the current beat. */
export function evalBeatStep(
  beat: PraxisBeat,
  stepIndex: number,
  m: PostureMetrics,
  prev: PostureMetrics | null,
  base: PostureBaseline,
  th: AdventureThresholds = DEFAULT_ADVENTURE_THRESHOLDS,
): BeatStepEval {
  const holdTh = { solveHoldMs: th.stepHoldMs };

  switch (beat.eval.type) {
    case 'move':
      return evalPuzzleMove(beat.eval.move, m, prev, base, holdTh);
    case 'two': {
      const move = stepIndex === 0 ? beat.eval.a : beat.eval.b;
      return evalPuzzleMove(move, m, prev, base, holdTh);
    }
    case 'chain':
      return evalPuzzleMove(beat.eval.moves[stepIndex]!, m, prev, base, holdTh);
    case 'imitate': {
      const pat: BilateralPattern = {
        id: beat.id,
        name: beat.name,
        icon: beat.icon,
        kind: 'zones',
        leftArm: beat.eval.left,
        rightArm: beat.eval.right,
      };
      const ev = evalBilateral(pat, m, prev, base);
      return { ok: ev.ok, score: ev.score, holdMs: ev.holdMs, transient: ev.transient };
    }
    case 'novel':
      return evalNovel(beat.eval.kind, m, prev, base);
    default:
      return { ok: false, score: 0, holdMs: th.stepHoldMs, transient: false };
  }
}

/** Label for the active step chip row. */
export function stepLabel(beat: PraxisBeat, stepIndex: number): string {
  switch (beat.eval.type) {
    case 'move':
      return beat.eval.move.label;
    case 'two':
      return stepIndex === 0 ? beat.eval.a.label : beat.eval.b.label;
    case 'chain':
      return beat.eval.moves[stepIndex]?.label ?? beat.name;
    default:
      return beat.name;
  }
}

export function stepIcon(beat: PraxisBeat, stepIndex: number): string {
  switch (beat.eval.type) {
    case 'move':
      return beat.eval.move.icon;
    case 'two':
      return stepIndex === 0 ? beat.eval.a.icon : beat.eval.b.icon;
    case 'chain':
      return beat.eval.moves[stepIndex]?.icon ?? beat.icon;
    default:
      return beat.icon;
  }
}

/** Optional reach anchor for step cursor on targeted moves. */
export function stepAnchor(beats: PraxisBeat[], beatIndex: number): Anchor | null {
  const trail = beatsToTrail(beats);
  return trail[beatIndex]?.anchor ?? null;
}

export type BeatStepChip = { label: string; icon: string };

/** Step chips for multi-step beats (two / chain). */
export function beatStepChips(beat: PraxisBeat): BeatStepChip[] {
  switch (beat.eval.type) {
    case 'two':
      return [
        { label: beat.eval.a.label, icon: beat.eval.a.icon },
        { label: beat.eval.b.label, icon: beat.eval.b.icon },
      ];
    case 'chain':
      return beat.eval.moves.map((m) => ({ label: m.label, icon: m.icon }));
    default:
      return [{ label: beat.name, icon: beat.icon }];
  }
}
