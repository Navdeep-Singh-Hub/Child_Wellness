/**
 * OT Level 7 · Session 1 — Linear Vestibular Movement
 * Extends Level 6 pose math with forward-walk, path-alignment and dynamic-balance
 * signals for camera-tracked walking games (APK + web).
 */
export {
  averageBaseline,
  centerOfMass,
  computeMetrics,
  DEFAULT_BASELINE,
  EMPTY_METRICS,
  frameMotionFull,
  legLift,
  limbMotion,
  movementIntensity,
  shiftZone,
  uprightScore,
  weightShift,
  type PostureBaseline,
  type PostureMetrics,
  type ShiftDir,
} from '@/components/game/occupational/level6/session1/poseUtils';

import {
  centerOfMass,
  legLift,
  limbMotion,
  uprightScore,
  weightShift,
  type PostureBaseline,
  type PostureMetrics,
} from '@/components/game/occupational/level6/session1/poseUtils';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Shoulder-width growth vs baseline — proxy for walking toward the camera. */
export function walkApproachScale(m: PostureMetrics, base: PostureBaseline): number {
  if (!m.present) return 0;
  const ratio = m.shoulderWidth / Math.max(0.08, base.shoulderWidthBase);
  return clamp01((ratio - 0.94) / 0.32);
}

/** Combined forward-movement signal 0..1 (approach + rising center of mass in frame). */
export function walkForwardSignal(m: PostureMetrics, base: PostureBaseline): number {
  if (!m.present) return 0;
  const scale = walkApproachScale(m, base);
  const com = centerOfMass(m);
  const vertical = clamp01((base.comY - com.y) / 0.16);
  return clamp01(scale * 0.55 + vertical * 0.45);
}

/** How centered the child is on the walking path (1 = on track, 0 = wandered). */
export function pathAlignment(shiftX: number, tol = 0.24): number {
  return clamp01(1 - Math.abs(shiftX) / tol);
}

/**
 * Balance quality during forward walking — tolerates moderate rhythmic motion
 * while still penalising collapse and excessive sway.
 */
export function walkBalance(m: PostureMetrics, base: PostureBaseline, motion: number): number {
  if (!m.present) return 0;
  const up = uprightScore(m, base);
  const controlled = clamp01(1 - Math.max(0, motion - 0.07) / 0.14);
  return clamp01(up * 0.5 + controlled * 0.5);
}

export type WalkStepResult = {
  stepped: boolean;
  lifted: 'left' | 'right' | 'none';
  armed: boolean;
};

export type WalkStepOpts = {
  liftMin: number;
  refractoryMs: number;
  motionHigh: number;
  motionLow: number;
};

/**
 * Detect a forward walking step from alternating leg lifts or motion bursts
 * when ankles are off-frame.
 */
export function detectWalkStep(
  prev: PostureMetrics | null,
  cur: PostureMetrics,
  lastLifted: 'left' | 'right' | 'none',
  lastRepAt: number,
  now: number,
  armed: boolean,
  opts: WalkStepOpts,
): WalkStepResult {
  const lift = legLift(cur);
  if (lift.legsVisible && lift.lifted !== 'none' && lift.amount >= opts.liftMin) {
    if (lift.lifted !== lastLifted && now - lastRepAt >= opts.refractoryMs) {
      return { stepped: true, lifted: lift.lifted, armed: false };
    }
    return { stepped: false, lifted: lastLifted, armed };
  }

  const motion = limbMotion(prev, cur);
  if (!armed && motion >= opts.motionHigh && now - lastRepAt >= opts.refractoryMs) {
    return { stepped: true, lifted: lastLifted, armed: true };
  }
  const nextArmed = motion < opts.motionLow ? false : armed;
  return { stepped: false, lifted: lastLifted, armed: nextArmed };
}

/** Composite walk quality for AI scoring: posture + path + controlled motion. */
export function linearWalkQuality(
  m: PostureMetrics,
  base: PostureBaseline,
  motion: number,
): number {
  if (!m.present) return 0;
  const ws = weightShift(m, base);
  const bal = walkBalance(m, base, motion);
  const align = pathAlignment(ws.x);
  const forward = walkForwardSignal(m, base);
  return clamp01(bal * 0.45 + align * 0.3 + forward * 0.15 + uprightScore(m, base) * 0.1);
}
