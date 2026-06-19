/**
 * OT Level 8 · Session 5 — Body Position Planning.
 *
 * The child plans and moves their whole body into a target POSITION and holds
 * it: reach high, reach low, reach to a side, turn the body, or make a shape.
 * evalPosition() scores how well the current pose matches the target position.
 */
import {
  uprightScore,
  weightShift,
  type PostureBaseline,
  type PostureMetrics,
  type Point,
} from '@/components/game/occupational/level6/session1/poseUtils';
import { classifyArms } from '@/components/game/occupational/level8/session4/poseMatch';

export type PositionKind = 'reachHigh' | 'reachLow' | 'reachSide' | 'turn' | 'shape';
export type ShapeVariant = 'star' | 'tall' | 'ball' | 'wide';

export type PositionSpec = {
  id: string;
  kind: PositionKind;
  name: string;
  icon: string;
  /** reachHigh / reachLow: how many hands. */
  hands?: 1 | 2;
  /** reachSide / turn: which side (screen-relative). */
  side?: 'left' | 'right';
  /** shape: which body shape. */
  shape?: ShapeVariant;
};

export type PositionThresholds = {
  positionHoldMs: number;
  highRise: number;
  lowDepth: number;
  sideOut: number;
  turnShrink: number;
  crouchY: number;
};

export type PositionEval = { ok: boolean; score: number; holdMs: number };

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Normalized stage anchor where the target zone marker should sit (0..1). */
export function zoneAnchor(spec: PositionSpec): Point {
  switch (spec.kind) {
    case 'reachHigh':
      return { x: 0.5, y: 0.16 };
    case 'reachLow':
      return { x: 0.5, y: 0.82 };
    case 'reachSide':
      return spec.side === 'left' ? { x: 0.16, y: 0.46 } : { x: 0.84, y: 0.46 };
    case 'turn':
      return { x: 0.5, y: 0.4 };
    case 'shape':
    default:
      return { x: 0.5, y: 0.42 };
  }
}

/** A directional arrow glyph hinting where to move. */
export function directionArrow(spec: PositionSpec): string {
  switch (spec.kind) {
    case 'reachHigh':
      return '⬆️';
    case 'reachLow':
      return '⬇️';
    case 'reachSide':
      return spec.side === 'left' ? '⬅️' : '➡️';
    case 'turn':
      return spec.side === 'left' ? '↺' : '↻';
    case 'shape':
    default:
      return '✨';
  }
}

export function evalPosition(
  m: PostureMetrics,
  base: PostureBaseline,
  spec: PositionSpec,
  th: PositionThresholds,
): PositionEval {
  const hold = th.positionHoldMs;
  if (!m.present) return { ok: false, score: 0, holdMs: hold };

  const sw = Math.max(0.08, m.shoulderWidth);
  const sy = m.shoulderMid.y;
  const { ups, outs } = classifyArms(m);
  const wrists = [m.leftWrist, m.rightWrist].filter((w): w is Point => !!w);

  switch (spec.kind) {
    case 'reachHigh': {
      const need = spec.hands ?? 2;
      const rises = wrists.map((w) => (sy - w.y) / sw).sort((a, b) => b - a);
      const top = rises.slice(0, need);
      const avg = top.length ? top.reduce((a, b) => a + b, 0) / top.length : -1;
      return { ok: ups >= need, score: clamp01((avg + 0.2) / (th.highRise + 0.2)), holdMs: hold };
    }
    case 'reachLow': {
      const need = spec.hands ?? 2;
      const depths = wrists.map((w) => (w.y - sy) / sw).sort((a, b) => b - a);
      const top = depths.slice(0, need);
      const avg = top.length ? top.reduce((a, b) => a + b, 0) / top.length : 0;
      const lowCount = wrists.filter((w) => (w.y - sy) / sw >= th.lowDepth).length;
      return { ok: lowCount >= need, score: clamp01(avg / (th.lowDepth + 0.4)), holdMs: hold };
    }
    case 'reachSide': {
      const side = spec.side ?? 'right';
      const mws = wrists.map((w) => ({ x: 1 - w.x, y: w.y })); // mirror to screen
      const onSide = (w: Point) =>
        side === 'left' ? w.x <= 0.5 - th.sideOut : w.x >= 0.5 + th.sideOut;
      const sideOk = mws.some((w) => onSide(w) && Math.abs(w.y - sy) <= 0.65);
      const ext = mws.length
        ? Math.max(...mws.map((w) => (side === 'left' ? 0.5 - w.x : w.x - 0.5)))
        : 0;
      return { ok: outs >= 1 && sideOk, score: clamp01(ext / (th.sideOut + 0.25)), holdMs: hold };
    }
    case 'turn': {
      const ratio = m.shoulderWidth / Math.max(0.08, base.shoulderWidthBase);
      return { ok: ratio <= th.turnShrink, score: clamp01((1 - ratio) / (1 - th.turnShrink)), holdMs: hold };
    }
    case 'shape':
    default: {
      const v = spec.shape ?? 'star';
      if (v === 'star' || v === 'wide') {
        return { ok: outs >= 2, score: clamp01(outs / 2), holdMs: hold };
      }
      if (v === 'tall') {
        const upright = uprightScore(m, base);
        return { ok: ups >= 2 && upright >= 0.45, score: clamp01(0.5 * (ups / 2) + 0.5 * upright), holdMs: hold };
      }
      // ball: crouch low + arms tucked in
      const ws = weightShift(m, base);
      const crouch = ws.y >= th.crouchY;
      const armsIn = ups === 0 && outs === 0;
      return {
        ok: crouch && armsIn,
        score: clamp01(0.6 * clamp01(ws.y / Math.max(0.05, th.crouchY)) + 0.4 * (armsIn ? 1 : 0)),
        holdMs: hold,
      };
    }
  }
}
