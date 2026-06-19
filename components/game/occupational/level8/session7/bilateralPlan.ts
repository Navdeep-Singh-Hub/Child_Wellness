/**
 * OT Level 8 · Session 7 — Bilateral Motor Planning.
 *
 * Patterns require coordinated use of BOTH sides: symmetric twin moves, cross-
 * body claps, bear-crawl shapes, mirrored arm positions and dual actions.
 * evalBilateral() scores how well both arms match the target pattern.
 */
import {
  weightShift,
  type PostureBaseline,
  type PostureMetrics,
} from '@/components/game/occupational/level6/session1/poseUtils';
import {
  DEFAULT_THRESHOLDS,
  evaluateAction,
  makeStep,
} from '@/components/game/occupational/level8/motorActions';
import { classifyArms, type ArmZone } from '@/components/game/occupational/level8/session4/poseMatch';

export type BilateralKind = 'zones' | 'clap' | 'crossClap' | 'bear';

export type BilateralPattern = {
  id: string;
  name: string;
  icon: string;
  kind: BilateralKind;
  leftArm?: ArmZone;
  rightArm?: ArmZone;
};

export type BilateralThresholds = {
  holdMs: number;
  crouchY: number;
};

export type BilateralEval = {
  ok: boolean;
  score: number;
  holdMs: number;
  transient: boolean;
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const zoneScore = (actual: ArmZone | null, want: ArmZone): number => {
  if (!actual) return 0;
  if (actual === want) return 1;
  if (want === 'up' && actual === 'out') return 0.45;
  if (want === 'out' && (actual === 'up' || actual === 'down')) return 0.4;
  if (want === 'down' && actual === 'out') return 0.35;
  return 0.1;
};

/** Hands meet in front with arms crossed over the midline. */
export function isCrossedClap(m: PostureMetrics): boolean {
  if (!m.leftWrist || !m.rightWrist) return false;
  const lw = { x: 1 - m.leftWrist.x, y: m.leftWrist.y };
  const rw = { x: 1 - m.rightWrist.x, y: m.rightWrist.y };
  const dist = Math.hypot(lw.x - rw.x, lw.y - rw.y);
  return dist <= DEFAULT_THRESHOLDS.clapDist * 1.15 && lw.x > rw.x;
}

/** Per-frame detection for one bilateral pattern. */
export function evalBilateral(
  pattern: BilateralPattern,
  m: PostureMetrics,
  prev: PostureMetrics | null,
  base: PostureBaseline,
  th: BilateralThresholds,
): BilateralEval {
  const hold = th.holdMs;
  if (!m.present) return { ok: false, score: 0, holdMs: hold, transient: false };

  if (pattern.kind === 'clap' || pattern.kind === 'crossClap') {
    const step = makeStep('clap');
    const ev = evaluateAction(step, m, prev, base, null, DEFAULT_THRESHOLDS);
    if (pattern.kind === 'clap') {
      return { ok: ev.ok, score: ev.approach, holdMs: ev.holdMs || hold, transient: false };
    }
    const crossed = ev.ok && isCrossedClap(m);
    return {
      ok: crossed,
      score: crossed ? ev.approach : ev.approach * 0.55,
      holdMs: ev.holdMs || hold,
      transient: false,
    };
  }

  if (pattern.kind === 'bear') {
    const { leftZone, rightZone } = classifyArms(m);
    const armsLow =
      (leftZone === 'down' || leftZone === 'out') && (rightZone === 'down' || rightZone === 'out');
    const ws = weightShift(m, base);
    const crouch = ws.y >= th.crouchY;
    const ok = armsLow && crouch;
    const score = clamp01(0.55 * (armsLow ? 1 : 0.35) + 0.45 * clamp01(ws.y / Math.max(0.05, th.crouchY)));
    return { ok, score, holdMs: hold, transient: false };
  }

  const { leftZone, rightZone } = classifyArms(m);
  const wantL = pattern.leftArm!;
  const wantR = pattern.rightArm!;
  const ok = leftZone === wantL && rightZone === wantR;
  const score = clamp01(0.5 * zoneScore(leftZone, wantL) + 0.5 * zoneScore(rightZone, wantR));
  return { ok, score, holdMs: hold, transient: false };
}

/** Short label for L/R arm zones shown in the overlay. */
export function zoneLabel(z: ArmZone): string {
  switch (z) {
    case 'up':
      return 'UP';
    case 'out':
      return 'OUT';
    case 'down':
    default:
      return 'DOWN';
  }
}
