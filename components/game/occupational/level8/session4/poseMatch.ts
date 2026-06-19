/**
 * OT Level 8 · Session 4 — Motor Imitation pose matching.
 *
 * Classifies each arm into a coarse zone (up / out / down) from the pose
 * landmarks and scores how well the child's body copies a demonstrated pose
 * template. Designed to be scale- and position-invariant (uses shoulder width
 * and shoulder midline as references) so it works at any distance.
 */
import {
  weightShift,
  type PostureBaseline,
  type PostureMetrics,
  type Point,
} from '@/components/game/occupational/level6/session1/poseUtils';

export type ArmZone = 'up' | 'out' | 'down';

export type PoseTemplate = {
  id: string;
  name: string;
  /** Demonstrated arm positions (child's own left / right hands). */
  leftArm: ArmZone;
  rightArm: ArmZone;
  /** Optional body lean for the pose. */
  lean?: 'left' | 'right';
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const LEAN_TOL = 0.07;

/** Required raised / out-to-side arm counts for a template. */
export function templateCounts(t: PoseTemplate): { up: number; out: number } {
  const arms = [t.leftArm, t.rightArm];
  return {
    up: arms.filter((a) => a === 'up').length,
    out: arms.filter((a) => a === 'out').length,
  };
}

const zoneOfWrist = (w: Point | null, sx: number, sy: number, sw: number): ArmZone | null => {
  if (!w) return null;
  const dy = (w.y - sy) / sw; // negative = above the shoulder line
  const dx = Math.abs(w.x - sx) / sw;
  if (dy <= -0.35) return 'up';
  if (dx >= 1.0 && dy <= 0.85) return 'out';
  return 'down';
};

/** Classify the child's arms into raised / out / down counts. */
export function classifyArms(m: PostureMetrics): { ups: number; outs: number; leftZone: ArmZone | null; rightZone: ArmZone | null } {
  if (!m.present) return { ups: 0, outs: 0, leftZone: null, rightZone: null };
  const sw = Math.max(0.08, m.shoulderWidth);
  const sx = m.shoulderMid.x;
  const sy = m.shoulderMid.y;
  const lz = zoneOfWrist(m.leftWrist, sx, sy, sw);
  const rz = zoneOfWrist(m.rightWrist, sx, sy, sw);
  const zones = [lz, rz];
  return {
    ups: zones.filter((z) => z === 'up').length,
    outs: zones.filter((z) => z === 'out').length,
    leftZone: lz,
    rightZone: rz,
  };
}

export type PoseMatch = { ok: boolean; score: number; leanOk: boolean };

/** Score how well the current pose copies the template (0..1) + a confirm flag. */
export function matchPose(m: PostureMetrics, base: PostureBaseline, t: PoseTemplate): PoseMatch {
  if (!m.present) return { ok: false, score: 0, leanOk: false };
  const { ups, outs } = classifyArms(m);
  const want = templateCounts(t);
  const armExact = ups === want.up && outs === want.out;
  const armApproach = clamp01(1 - (Math.abs(ups - want.up) + Math.abs(outs - want.out)) / 3);

  let leanOk = true;
  if (t.lean) {
    const ws: Point = weightShift(m, base);
    leanOk = t.lean === 'right' ? ws.x >= LEAN_TOL : ws.x <= -LEAN_TOL;
  }

  const ok = armExact && leanOk;
  const score = clamp01(armApproach * (t.lean ? (leanOk ? 1 : 0.5) : 1));
  return { ok, score, leanOk };
}
