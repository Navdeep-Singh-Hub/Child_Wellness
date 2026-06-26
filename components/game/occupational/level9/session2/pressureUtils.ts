/**
 * OT Level 9 · Session 2 — Pressure Grading pose math.
 * Piping-bag style graded pressure from wrist landmarks (MediaPipe, normalized 0..1).
 */
import {
  bilateralSqueezeSymmetry,
  chestChargeHeight,
  chestChargeSpread,
  forwardPressScore,
  forceMatchAccuracy,
  matchDirection,
  squeezeScore,
  wristForwardExtension,
  wristHeightMatch,
  type ForceBaseline,
} from '@/components/game/occupational/level9/session1/forceUtils';
import type { PostureMetrics } from '@/components/game/occupational/level6/session1/poseUtils';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * Decorate The Cake — piping-bag grip + forward extrusion at chest height.
 * Uses absolute normalized landmark coordinates vs calibrated baseline.
 */
export function decoratePressureScore(m: PostureMetrics, base: ForceBaseline): number {
  const squeeze = squeezeScore(m, base);
  const forward = forwardPressScore(m, base);
  const height = chestChargeHeight(m);
  const level = wristHeightMatch(m);
  const symmetry = bilateralSqueezeSymmetry(m);
  return clamp01(squeeze * 0.4 + forward * 0.3 + height * 0.18 + level * 0.07 + symmetry * 0.05);
}

/** Decoration slot positions around cake top (normalized 0..1 within cake zone). */
export const CAKE_DECORATION_SLOTS = [
  { x: 0.22, y: 0.18 },
  { x: 0.5, y: 0.08 },
  { x: 0.78, y: 0.18 },
  { x: 0.88, y: 0.45 },
  { x: 0.72, y: 0.72 },
  { x: 0.5, y: 0.82 },
  { x: 0.28, y: 0.72 },
  { x: 0.12, y: 0.45 },
] as const;

/** Brush reach toward canvas — max forward wrist extension vs baseline. */
export function brushReachScore(m: PostureMetrics, base: ForceBaseline): number {
  const raw = wristForwardExtension(m);
  const headroom = Math.max(0.22, 1 - base.wristForwardNorm);
  return clamp01((raw - base.wristForwardNorm * 0.45) / headroom);
}

/**
 * Paint Pressure — brush press on canvas (reach + forward press + light grip).
 * Uses absolute normalized landmark coordinates vs calibrated baseline.
 */
export function paintPressureScore(m: PostureMetrics, base: ForceBaseline): number {
  const forward = forwardPressScore(m, base);
  const squeeze = squeezeScore(m, base);
  const reach = brushReachScore(m, base);
  const height = chestChargeHeight(m);
  const symmetry = bilateralSqueezeSymmetry(m);
  return clamp01(forward * 0.4 + squeeze * 0.22 + reach * 0.26 + height * 0.07 + symmetry * 0.05);
}

/** Canvas paint cell grid (2×4), normalized within canvas zone. */
export const CANVAS_PAINT_CELLS = [
  { col: 0, row: 0 },
  { col: 1, row: 0 },
  { col: 2, row: 0 },
  { col: 3, row: 0 },
  { col: 0, row: 1 },
  { col: 1, row: 1 },
  { col: 2, row: 1 },
  { col: 3, row: 1 },
] as const;

/** Floating crystal touch spots (mirrored screen coords 0..1). */
export const MAGIC_CRYSTAL_SPOTS = [
  { x: 0.32, y: 0.44 },
  { x: 0.68, y: 0.4 },
  { x: 0.24, y: 0.56 },
  { x: 0.76, y: 0.52 },
  { x: 0.4, y: 0.36 },
  { x: 0.6, y: 0.58 },
  { x: 0.5, y: 0.42 },
  { x: 0.44, y: 0.54 },
] as const;

/**
 * Magic Touch — gentle fingertip reach with light forward contact.
 * Penalizes crushing squeeze; rewards delicate extension.
 */
export function magicTouchScore(m: PostureMetrics, base: ForceBaseline): number {
  const forward = forwardPressScore(m, base);
  const reach = brushReachScore(m, base);
  const squeeze = squeezeScore(m, base);
  const contact = clamp01(forward * 0.42 + reach * 0.48);
  const crushPenalty = clamp01(Math.max(0, squeeze - contact * 0.55) / 0.35);
  return clamp01(contact * (1 - crushPenalty * 0.55));
}

/** Raw squeeze level for crush warnings (0..1). */
export function magicCrushLevel(m: PostureMetrics, base: ForceBaseline): number {
  return squeezeScore(m, base);
}

/** Distance from leading wrist to crystal spot (0 = on spot, higher = farther). */
export function wristToSpotDistance(
  m: PostureMetrics,
  spot: { x: number; y: number },
): number {
  const wrists = [m.leftWrist, m.rightWrist].filter(Boolean) as { x: number; y: number }[];
  if (!wrists.length) return 1;
  let best = 1;
  for (const w of wrists) {
    const mx = 1 - w.x;
    const d = Math.hypot(mx - spot.x, w.y - spot.y);
    if (d < best) best = d;
  }
  return best;
}

/** Leading wrist mirrored position for overlay. */
export function leadingMirroredWrist(m: PostureMetrics): { x: number; y: number } | null {
  if (!m.leftWrist && !m.rightWrist) return null;
  const lw = m.leftWrist ? { x: 1 - m.leftWrist.x, y: m.leftWrist.y } : null;
  const rw = m.rightWrist ? { x: 1 - m.rightWrist.x, y: m.rightWrist.y } : null;
  if (!lw) return rw;
  if (!rw) return lw;
  const sm = m.shoulderMid;
  const lReach = sm.y - m.leftWrist!.y;
  const rReach = sm.y - m.rightWrist!.y;
  return lReach >= rReach ? lw : rw;
}

export type InflateFillStatus = 'empty' | 'filling' | 'zone' | 'overfill' | 'popped';

/**
 * Inflate Carefully — steady bilateral inflation pressure for cloud balloons.
 * Emphasizes controlled squeeze + forward press + symmetry.
 */
export function inflateCarefulScore(m: PostureMetrics, base: ForceBaseline): number {
  const squeeze = squeezeScore(m, base);
  const forward = forwardPressScore(m, base);
  const height = chestChargeHeight(m);
  const symmetry = bilateralSqueezeSymmetry(m);
  const level = wristHeightMatch(m);
  return clamp01(squeeze * 0.36 + forward * 0.34 + height * 0.14 + symmetry * 0.1 + level * 0.06);
}

/** Whether current inflation force risks popping the balloon. */
export function inflatePopRisk(force: number, targetForce: number, popMargin: number): boolean {
  return force > targetForce + popMargin;
}

/** Fill status vs target fill band and pop thresholds. */
export function inflateFillStatus(
  fill: number,
  targetFill: number,
  fillBand: number,
  force: number,
  targetForce: number,
  popMargin: number,
): InflateFillStatus {
  if (inflatePopRisk(force, targetForce, popMargin) || fill > targetFill + fillBand * 1.6) return 'popped';
  if (fill > targetFill + fillBand) return 'overfill';
  if (fill >= targetFill - fillBand && fill <= targetFill + fillBand) return 'zone';
  if (fill > 0.18) return 'filling';
  return 'empty';
}

export type GoldilocksZone = 'too_soft' | 'just_right' | 'too_hard';

/** Goldilocks Pressure — balanced stir-and-press for porridge tasting. */
export function goldilocksPressureScore(m: PostureMetrics, base: ForceBaseline): number {
  const squeeze = squeezeScore(m, base);
  const forward = forwardPressScore(m, base);
  const height = chestChargeHeight(m);
  const symmetry = bilateralSqueezeSymmetry(m);
  const spread = chestChargeSpread(m, base);
  return clamp01(squeeze * 0.32 + forward * 0.3 + height * 0.16 + symmetry * 0.12 + spread * 0.1);
}

/** Map force to Goldilocks zone vs target. */
export function goldilocksZone(force: number, target: number, tolerance: number): GoldilocksZone {
  const dir = matchDirection(force, target, tolerance);
  if (dir === 'matched') return 'just_right';
  if (dir === 'high') return 'too_hard';
  return 'too_soft';
}

export { forceMatchAccuracy };
