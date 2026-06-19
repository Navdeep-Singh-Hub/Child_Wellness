/**
 * OT Level 8 · Session 6 — Obstacle Navigation.
 *
 * The child navigates a themed path gate-by-gate. Each gate is an obstacle that
 * requires a specific body move (duck, climb, jump, swerve, turn, balance, step).
 * evalObstacle() scores whether the child cleared the current gate.
 */
import type { PostureBaseline, PostureMetrics } from '@/components/game/occupational/level6/session1/poseUtils';
import {
  DEFAULT_THRESHOLDS,
  evaluateAction,
  makeStep,
  type Anchor,
} from '@/components/game/occupational/level8/motorActions';
import { evalPosition, type PositionSpec } from '@/components/game/occupational/level8/session5/bodyPosition';
import { SESSION5_THRESHOLDS } from '@/components/game/occupational/level8/session5/session5Pacing';

export type ObstacleKind = 'duck' | 'climb' | 'jump' | 'swerveLeft' | 'swerveRight' | 'turn' | 'balance' | 'step';

export type ObstacleGate = {
  id: string;
  kind: ObstacleKind;
  name: string;
  icon: string;
  anchor: Anchor;
};

export type ObstacleEval = {
  ok: boolean;
  score: number;
  holdMs: number;
  probe: Anchor | null;
  transient: boolean;
};

export type ObstacleNavThresholds = {
  gateHoldMs: number;
  stepHoldMs: number;
};

export const DEFAULT_NAV_THRESHOLDS: ObstacleNavThresholds = {
  gateHoldMs: 620,
  stepHoldMs: 340,
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Serpentine path anchors from bottom → top of the stage. */
export function pathAnchors(count: number): Anchor[] {
  const n = Math.max(2, count);
  return Array.from({ length: n }, (_, i) => {
    const t = i / Math.max(1, n - 1);
    return { x: i % 2 === 0 ? 0.3 : 0.7, y: 0.78 - t * 0.56 };
  });
}

const posSpec = (kind: ObstacleKind): PositionSpec | null => {
  switch (kind) {
    case 'duck':
      return { id: 'duck', kind: 'reachLow', name: 'Duck', icon: '🦆', hands: 2 };
    case 'climb':
      return { id: 'climb', kind: 'reachHigh', name: 'Climb', icon: '🧗', hands: 2 };
    case 'swerveLeft':
      return { id: 'swl', kind: 'reachSide', name: 'Swerve Left', icon: '⬅️', side: 'left' };
    case 'swerveRight':
      return { id: 'swr', kind: 'reachSide', name: 'Swerve Right', icon: '➡️', side: 'right' };
    case 'turn':
      return { id: 'turn', kind: 'turn', name: 'Turn', icon: '🌀', side: 'left' };
    default:
      return null;
  }
};

/** Per-frame detection for one obstacle gate. */
export function evalObstacle(
  gate: ObstacleGate,
  m: PostureMetrics,
  prev: PostureMetrics | null,
  base: PostureBaseline,
  th: ObstacleNavThresholds = DEFAULT_NAV_THRESHOLDS,
): ObstacleEval {
  const pos = posSpec(gate.kind);
  if (pos) {
    const ev = evalPosition(m, base, pos, { ...SESSION5_THRESHOLDS, positionHoldMs: th.gateHoldMs });
    return { ok: ev.ok, score: ev.score, holdMs: ev.holdMs, probe: null, transient: false };
  }

  if (gate.kind === 'step') {
    const step = makeStep('reach', gate.anchor);
    const ev = evaluateAction(step, m, prev, base, gate.anchor, {
      ...DEFAULT_THRESHOLDS,
      reachHoldMs: th.stepHoldMs,
    });
    return { ok: ev.ok, score: ev.approach, holdMs: ev.holdMs, probe: ev.probe, transient: false };
  }

  const actionKind = gate.kind === 'jump' ? 'jump' : gate.kind === 'balance' ? 'freeze' : 'turn';
  const step = makeStep(actionKind);
  const ev = evaluateAction(step, m, prev, base, null, DEFAULT_THRESHOLDS);
  return {
    ok: ev.ok,
    score: ev.approach,
    holdMs: ev.transient ? 0 : ev.holdMs || th.gateHoldMs,
    probe: ev.probe,
    transient: ev.transient,
  };
}

/** Hint arrow for the active gate. */
export function gateArrow(kind: ObstacleKind): string {
  switch (kind) {
    case 'duck':
      return '⬇️';
    case 'climb':
      return '⬆️';
    case 'jump':
      return '⬆️';
    case 'swerveLeft':
      return '⬅️';
    case 'swerveRight':
      return '➡️';
    case 'turn':
      return '↺';
    case 'balance':
      return '🧊';
    case 'step':
    default:
      return '👣';
  }
}
