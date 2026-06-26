/**
 * OT Level 6 · Session 1 — Sitting Posture Control
 * Pose math: turns raw body landmarks into therapy-meaningful posture signals.
 *
 * Landmark source is MediaPipe Pose (BlazePose, 33 points, normalized 0..1,
 * origin top-left). The same shape can later be fed from a native pose plugin.
 */

export type PoseLandmark = {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
};

/** BlazePose 33-landmark indices we rely on. */
export const POSE_IDX = {
  nose: 0,
  leftEye: 2,
  rightEye: 5,
  leftEar: 7,
  rightEar: 8,
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
} as const;

export type Point = { x: number; y: number };

export type PostureMetrics = {
  present: boolean;
  /** Lateral head tilt from horizontal ear/eye line, degrees (0 = level). */
  headTiltDeg: number;
  /** Shoulder line angle from horizontal, degrees (0 = level shoulders). */
  shoulderTiltDeg: number;
  /** Trunk lean from vertical (hip-mid → shoulder-mid), degrees (0 = upright). */
  trunkLeanDeg: number;
  /** Nose horizontal offset from shoulder midline, normalized by shoulder width. */
  headOffsetNorm: number;
  /** Shoulder width (normalized) — used as a scale reference for elongation. */
  shoulderWidth: number;
  /** Shoulder midpoint, normalized screen coords. */
  shoulderMid: Point;
  /** Hip midpoint, normalized screen coords. */
  hipMid: Point;
  /** Hips (normalized). null when not confidently visible. */
  leftHip: Point | null;
  rightHip: Point | null;
  /** Wrists (normalized). null when not confidently visible. */
  leftWrist: Point | null;
  rightWrist: Point | null;
  /** Elbows (normalized). null when not confidently visible. */
  leftElbow: Point | null;
  rightElbow: Point | null;
  /** Shoulders (normalized). null when not confidently visible. */
  leftShoulder: Point | null;
  rightShoulder: Point | null;
  /** Nose point (normalized) — used for stillness tracking. */
  nose: Point | null;
  /** Ankles & knees (normalized). null when not confidently visible (legs off-frame). */
  leftAnkle: Point | null;
  rightAnkle: Point | null;
  leftKnee: Point | null;
  rightKnee: Point | null;
};

export type PostureBaseline = {
  trunkLeanDeg: number;
  shoulderTiltDeg: number;
  headTiltDeg: number;
  headOffsetNorm: number;
  /** Baseline torso elongation (nose→hip span / shoulder width) for stretch games. */
  elongationNorm: number;
  /** Baseline head pitch (nose height above shoulders / shoulder width) for look up/down. */
  headPitchNorm: number;
  /** Baseline center-of-mass screen position (normalized) for weight-shift games. */
  comX: number;
  comY: number;
  /** Baseline shoulder width (facing forward) — reference for body-turn detection. */
  shoulderWidthBase: number;
};

const RAD2DEG = 180 / Math.PI;

const mid = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

const visible = (lm: PoseLandmark | undefined, min = 0.4): boolean =>
  !!lm && (lm.visibility === undefined || lm.visibility >= min);

/** Angle of segment a→b measured from the horizontal axis, in degrees (-90..90). */
const lineAngleFromHorizontal = (a: Point, b: Point): number => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.atan2(dy, dx) * RAD2DEG;
};

/** Angle of segment from vertical (straight up), in degrees. 0 = perfectly upright. */
const angleFromVertical = (from: Point, to: Point): number => {
  // Vector pointing "up" the torso (toward head). Screen y grows downward.
  const dx = to.x - from.x;
  const dy = to.y - from.y; // negative when 'to' is above 'from'
  // Angle of vector relative to straight up (0,-1).
  const ang = Math.atan2(dx, -dy) * RAD2DEG;
  return ang;
};

export const EMPTY_METRICS: PostureMetrics = {
  present: false,
  headTiltDeg: 0,
  shoulderTiltDeg: 0,
  trunkLeanDeg: 0,
  headOffsetNorm: 0,
  shoulderWidth: 0.25,
  shoulderMid: { x: 0.5, y: 0.4 },
  hipMid: { x: 0.5, y: 0.8 },
  leftHip: null,
  rightHip: null,
  leftWrist: null,
  rightWrist: null,
  leftElbow: null,
  rightElbow: null,
  leftShoulder: null,
  rightShoulder: null,
  nose: null,
  leftAnkle: null,
  rightAnkle: null,
  leftKnee: null,
  rightKnee: null,
};

/**
 * Compute posture metrics from a single pose (array of 33 landmarks).
 * Returns present:false when the core upper-body points are not reliable.
 */
export function computeMetrics(pose: PoseLandmark[] | null | undefined): PostureMetrics {
  if (!pose || pose.length < 25) return EMPTY_METRICS;

  const ls = pose[POSE_IDX.leftShoulder];
  const rs = pose[POSE_IDX.rightShoulder];
  const lh = pose[POSE_IDX.leftHip];
  const rh = pose[POSE_IDX.rightHip];
  const nose = pose[POSE_IDX.nose];

  if (!visible(ls) || !visible(rs)) return EMPTY_METRICS;

  const shoulderMid = mid(ls, rs);
  // Hips may be off-frame for close sitting shots — fall back to a synthetic
  // hip point directly below the shoulders so trunk lean still reads sensibly.
  const haveHips = visible(lh, 0.3) && visible(rh, 0.3);
  const hipMid = haveHips ? mid(lh!, rh!) : { x: shoulderMid.x, y: Math.min(0.98, shoulderMid.y + 0.32) };

  const shoulderTiltDeg = lineAngleFromHorizontal(ls, rs);
  const trunkLeanDeg = angleFromVertical(hipMid, shoulderMid);

  // Head tilt from ear line, fallback to eye line.
  const le = pose[POSE_IDX.leftEar];
  const re = pose[POSE_IDX.rightEar];
  const lEye = pose[POSE_IDX.leftEye];
  const rEye = pose[POSE_IDX.rightEye];
  let headTiltDeg = 0;
  if (visible(le, 0.3) && visible(re, 0.3)) headTiltDeg = lineAngleFromHorizontal(le!, re!);
  else if (visible(lEye, 0.3) && visible(rEye, 0.3)) headTiltDeg = lineAngleFromHorizontal(lEye!, rEye!);

  const shoulderWidth = Math.max(0.08, Math.hypot(rs.x - ls.x, rs.y - ls.y));
  const headOffsetNorm = visible(nose, 0.3) ? (nose!.x - shoulderMid.x) / shoulderWidth : 0;

  const lw = pose[POSE_IDX.leftWrist];
  const rw = pose[POSE_IDX.rightWrist];
  const leftElbowLm = pose[POSE_IDX.leftElbow];
  const rightElbowLm = pose[POSE_IDX.rightElbow];
  const la = pose[POSE_IDX.leftAnkle];
  const ra = pose[POSE_IDX.rightAnkle];
  const lk = pose[POSE_IDX.leftKnee];
  const rk = pose[POSE_IDX.rightKnee];

  return {
    present: true,
    headTiltDeg,
    shoulderTiltDeg,
    trunkLeanDeg,
    headOffsetNorm,
    shoulderWidth,
    shoulderMid,
    hipMid,
    leftHip: haveHips ? { x: lh!.x, y: lh!.y } : null,
    rightHip: haveHips ? { x: rh!.x, y: rh!.y } : null,
    leftWrist: visible(lw, 0.3) ? { x: lw!.x, y: lw!.y } : null,
    rightWrist: visible(rw, 0.3) ? { x: rw!.x, y: rw!.y } : null,
    leftElbow: visible(leftElbowLm, 0.3) ? { x: leftElbowLm!.x, y: leftElbowLm!.y } : null,
    rightElbow: visible(rightElbowLm, 0.3) ? { x: rightElbowLm!.x, y: rightElbowLm!.y } : null,
    leftShoulder: { x: ls.x, y: ls.y },
    rightShoulder: { x: rs.x, y: rs.y },
    nose: visible(nose, 0.3) ? { x: nose!.x, y: nose!.y } : null,
    leftAnkle: visible(la, 0.3) ? { x: la!.x, y: la!.y } : null,
    rightAnkle: visible(ra, 0.3) ? { x: ra!.x, y: ra!.y } : null,
    leftKnee: visible(lk, 0.3) ? { x: lk!.x, y: lk!.y } : null,
    rightKnee: visible(rk, 0.3) ? { x: rk!.x, y: rk!.y } : null,
  };
}

export const DEFAULT_BASELINE: PostureBaseline = {
  trunkLeanDeg: 0,
  shoulderTiltDeg: 0,
  headTiltDeg: 0,
  headOffsetNorm: 0,
  elongationNorm: 2.2,
  headPitchNorm: 1.1,
  comX: 0.5,
  comY: 0.6,
  shoulderWidthBase: 0.25,
};

/** Build a baseline from a set of "sit/stand tall" metric samples. */
export function averageBaseline(samples: PostureMetrics[]): PostureBaseline {
  const valid = samples.filter((s) => s.present);
  if (valid.length === 0) return DEFAULT_BASELINE;
  const sum = valid.reduce(
    (acc, s) => ({
      trunkLeanDeg: acc.trunkLeanDeg + s.trunkLeanDeg,
      shoulderTiltDeg: acc.shoulderTiltDeg + s.shoulderTiltDeg,
      headTiltDeg: acc.headTiltDeg + s.headTiltDeg,
      headOffsetNorm: acc.headOffsetNorm + s.headOffsetNorm,
      elongationNorm: acc.elongationNorm + elongationNorm(s),
      headPitchNorm: acc.headPitchNorm + headPitchRaw(s),
      comX: acc.comX + centerOfMass(s).x,
      comY: acc.comY + centerOfMass(s).y,
      shoulderWidthBase: acc.shoulderWidthBase + s.shoulderWidth,
    }),
    { trunkLeanDeg: 0, shoulderTiltDeg: 0, headTiltDeg: 0, headOffsetNorm: 0, elongationNorm: 0, headPitchNorm: 0, comX: 0, comY: 0, shoulderWidthBase: 0 },
  );
  const n = valid.length;
  return {
    trunkLeanDeg: sum.trunkLeanDeg / n,
    shoulderTiltDeg: sum.shoulderTiltDeg / n,
    headTiltDeg: sum.headTiltDeg / n,
    headOffsetNorm: sum.headOffsetNorm / n,
    elongationNorm: sum.elongationNorm / n,
    headPitchNorm: sum.headPitchNorm / n,
    comX: sum.comX / n,
    comY: sum.comY / n,
    shoulderWidthBase: sum.shoulderWidthBase / n,
  };
}

// Tolerances tuned for 4–10 year olds (forgiving but meaningful).
const LEAN_TOL = 20; // deg of trunk lean before score hits zero
const SHOULDER_TOL = 16; // deg of shoulder drop/tilt
const HEAD_TILT_TOL = 22; // deg of head tilt
const HEAD_OFFSET_TOL = 0.7; // normalized lateral head drift

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * Overall upright quality 0..1 relative to the calibrated baseline.
 * 1 = matching their best "sit tall" pose; 0 = heavily slouched/leaning.
 */
export function uprightScore(m: PostureMetrics, base: PostureBaseline): number {
  if (!m.present) return 0;
  const dLean = Math.abs(m.trunkLeanDeg - base.trunkLeanDeg) / LEAN_TOL;
  const dShoulder = Math.abs(m.shoulderTiltDeg - base.shoulderTiltDeg) / SHOULDER_TOL;
  const dHead = Math.abs(m.headTiltDeg - base.headTiltDeg) / HEAD_TILT_TOL;
  const dOffset = Math.abs(m.headOffsetNorm - base.headOffsetNorm) / HEAD_OFFSET_TOL;
  // Trunk dominates; head/shoulder refine.
  const penalty = dLean * 0.45 + dShoulder * 0.25 + dHead * 0.15 + dOffset * 0.15;
  return clamp01(1 - penalty);
}

/**
 * Crown / head stability 0..1 — how steady the head & neck are vs baseline.
 * Used by Crown Keeper.
 */
export function headStability(m: PostureMetrics, base: PostureBaseline): number {
  if (!m.present) return 0;
  const dHead = Math.abs(m.headTiltDeg - base.headTiltDeg) / HEAD_TILT_TOL;
  const dOffset = Math.abs(m.headOffsetNorm - base.headOffsetNorm) / HEAD_OFFSET_TOL;
  const dLean = Math.abs(m.trunkLeanDeg - base.trunkLeanDeg) / LEAN_TOL;
  const penalty = dHead * 0.45 + dOffset * 0.3 + dLean * 0.25;
  return clamp01(1 - penalty);
}

/**
 * Instantaneous body motion between two metric samples (0 = perfectly still).
 * Sums displacement of nose + both shoulders (normalized units).
 */
export function frameMotion(prev: PostureMetrics | null, cur: PostureMetrics): number {
  if (!prev || !prev.present || !cur.present) return 0;
  let d = Math.hypot(cur.shoulderMid.x - prev.shoulderMid.x, cur.shoulderMid.y - prev.shoulderMid.y);
  if (prev.nose && cur.nose) {
    d += Math.hypot(cur.nose.x - prev.nose.x, cur.nose.y - prev.nose.y);
  }
  return d;
}

const STILL_TOL = 0.05; // normalized motion that maps to stillness=0

/** Stillness score 0..1 from a motion magnitude (1 = frozen statue). */
export function stillnessFromMotion(motion: number): number {
  return clamp01(1 - motion / STILL_TOL);
}

export type PostureQuality = 'excellent' | 'good' | 'fix';

export function qualityFromScore(score: number): PostureQuality {
  if (score >= 0.8) return 'excellent';
  if (score >= 0.55) return 'good';
  return 'fix';
}

/** Human coaching cue from current metrics vs baseline. */
export function coachingCue(m: PostureMetrics, base: PostureBaseline): string {
  if (!m.present) return 'Sit so the camera can see your head and shoulders.';
  const lean = m.trunkLeanDeg - base.trunkLeanDeg;
  const shoulder = m.shoulderTiltDeg - base.shoulderTiltDeg;
  const head = m.headTiltDeg - base.headTiltDeg;
  if (Math.abs(lean) > LEAN_TOL * 0.6) return lean > 0 ? 'Stack tall — bring your back up straight!' : 'Stack tall — bring your back up straight!';
  if (Math.abs(shoulder) > SHOULDER_TOL * 0.6) return 'Level your shoulders — even and strong!';
  if (Math.abs(head) > HEAD_TILT_TOL * 0.6) return 'Lift your chin and keep your head straight!';
  return 'Beautiful tall sitting — hold it!';
}

export type ReachDir = 'left' | 'right' | 'up-left' | 'up-right';

/** Screen-anchor (normalized) for each reach target around a seated child. */
export const REACH_ANCHORS: Record<ReachDir, Point> = {
  left: { x: 0.12, y: 0.5 },
  right: { x: 0.88, y: 0.5 },
  'up-left': { x: 0.2, y: 0.18 },
  'up-right': { x: 0.8, y: 0.18 },
};

export const REACH_SEQUENCE: ReachDir[] = ['right', 'left', 'up-right', 'up-left'];

// ─────────────────────────────────────────────────────────────────────────────
// Session 2 — Standing Posture Control helpers
// ─────────────────────────────────────────────────────────────────────────────

const SWAY_TOL = 0.07; // normalized full-body motion that maps to stillness=0

/**
 * Whole-body motion between two samples (shoulders + hips + nose, optionally
 * wrists). Used for standing sway and statue stillness.
 */
export function frameMotionFull(
  prev: PostureMetrics | null,
  cur: PostureMetrics,
  includeWrists = false,
): number {
  if (!prev || !prev.present || !cur.present) return 0;
  let d = Math.hypot(cur.shoulderMid.x - prev.shoulderMid.x, cur.shoulderMid.y - prev.shoulderMid.y);
  d += Math.hypot(cur.hipMid.x - prev.hipMid.x, cur.hipMid.y - prev.hipMid.y);
  if (prev.nose && cur.nose) d += Math.hypot(cur.nose.x - prev.nose.x, cur.nose.y - prev.nose.y);
  if (includeWrists) {
    if (prev.leftWrist && cur.leftWrist)
      d += Math.hypot(cur.leftWrist.x - prev.leftWrist.x, cur.leftWrist.y - prev.leftWrist.y);
    if (prev.rightWrist && cur.rightWrist)
      d += Math.hypot(cur.rightWrist.x - prev.rightWrist.x, cur.rightWrist.y - prev.rightWrist.y);
  }
  return d;
}

/** Stillness score 0..1 from a whole-body motion magnitude (1 = frozen). */
export function swayStillness(motion: number): number {
  return clamp01(1 - motion / SWAY_TOL);
}

/** Torso elongation: vertical nose→hip span scaled by shoulder width (scale-invariant). */
export function elongationNorm(m: PostureMetrics): number {
  if (!m.present || !m.nose) return DEFAULT_BASELINE.elongationNorm;
  const span = m.hipMid.y - m.nose.y;
  return span / Math.max(0.08, m.shoulderWidth);
}

/** How high the wrists are raised, 0 (at shoulders) .. 1 (at/above nose height). */
export function armRaise(m: PostureMetrics): number {
  const ys: number[] = [];
  if (m.leftWrist) ys.push(m.leftWrist.y);
  if (m.rightWrist) ys.push(m.rightWrist.y);
  if (ys.length === 0) return 0;
  const minY = Math.min(...ys); // smaller y = higher on screen
  const bottom = m.shoulderMid.y;
  const top = m.nose ? m.nose.y : m.shoulderMid.y - 0.12;
  if (bottom - top <= 0.001) return 0;
  return clamp01((bottom - minY) / (bottom - top));
}

const STRETCH_RANGE = 0.55; // extra elongation (in shoulder-widths) for a full stretch

/**
 * Stretch / body-elongation score 0..1 (Grow Taller). Rewards extending the
 * torso taller than the calibrated baseline and reaching the arms upward.
 */
export function stretchScore(m: PostureMetrics, base: PostureBaseline): number {
  if (!m.present) return 0;
  const dElong = (elongationNorm(m) - base.elongationNorm) / STRETCH_RANGE;
  const elongPart = clamp01(dElong);
  const armPart = armRaise(m);
  return clamp01(elongPart * 0.65 + armPart * 0.35);
}

/** Shoulder symmetry 0..1 (Soldier Stand) — even shoulders score 1. */
export function shoulderSymmetry(m: PostureMetrics, base: PostureBaseline): number {
  if (!m.present) return 0;
  return clamp01(1 - Math.abs(m.shoulderTiltDeg - base.shoulderTiltDeg) / SHOULDER_TOL);
}

export type StandCommand = { label: string; cue: string };

/** Royal-guard standing commands for Soldier Stand. */
export const SOLDIER_COMMANDS: StandCommand[] = [
  { label: 'ATTENTION!', cue: 'Stand up tall and straight!' },
  { label: 'STEADY!', cue: 'Keep your shoulders level and still!' },
  { label: 'EYES FORWARD!', cue: 'Head straight, chin up!' },
  { label: 'HOLD THE LINE!', cue: 'Tall and strong — do not move!' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Session 3 — Head & Neck Stability helpers (head-direction tracking)
// ─────────────────────────────────────────────────────────────────────────────

/** Raw head yaw proxy: nose horizontal offset from shoulder midline / shoulder width. */
export function headYawRaw(m: PostureMetrics): number {
  return m.present ? m.headOffsetNorm : 0;
}

/** Raw head pitch proxy: nose height above shoulders / shoulder width (up = larger). */
export function headPitchRaw(m: PostureMetrics): number {
  if (!m.present || !m.nose) return DEFAULT_BASELINE.headPitchNorm;
  return (m.shoulderMid.y - m.nose.y) / Math.max(0.08, m.shoulderWidth);
}

export type HeadDir = 'left' | 'right' | 'up' | 'down';

const YAW_GAIN = 1.15;
const PITCH_GAIN = 1.2;

/**
 * Map head orientation to a normalized screen cursor (0..1) relative to the
 * calibrated "look straight" baseline. X is mirrored to match the selfie
 * preview, so turning the head right moves the cursor right on screen.
 */
export function headCursor(
  m: PostureMetrics,
  base: PostureBaseline,
  gainYaw = YAW_GAIN,
  gainPitch = PITCH_GAIN,
): Point {
  const yaw = headYawRaw(m) - base.headOffsetNorm;
  const pitch = headPitchRaw(m) - base.headPitchNorm;
  return {
    x: clamp01(0.5 - yaw * gainYaw), // mirrored
    y: clamp01(0.5 - pitch * gainPitch), // look up → cursor up
  };
}

/** Which direction zone a cursor falls into (for Look & Hold / Sky-Ground). */
export function dirZone(cursor: Point): HeadDir | 'center' {
  if (cursor.x < 0.34) return 'left';
  if (cursor.x > 0.66) return 'right';
  if (cursor.y < 0.34) return 'up';
  if (cursor.y > 0.66) return 'down';
  return 'center';
}

/**
 * Trunk-compensation motion: how much the torso (shoulders + hips) moved
 * between samples. Should stay near zero while only the head moves.
 */
export function trunkMotion(prev: PostureMetrics | null, cur: PostureMetrics): number {
  if (!prev || !prev.present || !cur.present) return 0;
  let d = Math.hypot(cur.shoulderMid.x - prev.shoulderMid.x, cur.shoulderMid.y - prev.shoulderMid.y);
  d += Math.hypot(cur.hipMid.x - prev.hipMid.x, cur.hipMid.y - prev.hipMid.y);
  return d;
}

const TRUNK_COMP_TOL = 0.045;

/** Trunk-stability score 0..1 (1 = body perfectly still while head moves). */
export function trunkStability(motion: number): number {
  return clamp01(1 - motion / TRUNK_COMP_TOL);
}

export type HeadTargetPattern = 'horizontal' | 'vertical' | 'diagonal' | 'circle' | 'wander';

/** Normalized target position for a moving-target follow at progress t (0..1). */
export function targetPath(pattern: HeadTargetPattern, t: number): Point {
  const tau = Math.PI * 2;
  switch (pattern) {
    case 'horizontal':
      return { x: 0.5 + 0.36 * Math.sin(tau * 1.5 * t), y: 0.45 };
    case 'vertical':
      return { x: 0.5, y: 0.5 + 0.34 * Math.sin(tau * 1.5 * t) };
    case 'diagonal':
      return { x: 0.5 + 0.34 * Math.sin(tau * 1.5 * t), y: 0.5 + 0.32 * Math.sin(tau * 1.5 * t) };
    case 'circle':
      return { x: 0.5 + 0.32 * Math.cos(tau * t), y: 0.46 + 0.3 * Math.sin(tau * t) };
    case 'wander':
    default:
      return {
        x: 0.5 + 0.32 * Math.sin(tau * 0.8 * t),
        y: 0.46 + 0.26 * Math.sin(tau * 1.3 * t + 1),
      };
  }
}

export const HEAD_DIR_SEQUENCE: HeadDir[] = ['left', 'right', 'up', 'down'];

export const HEAD_DIR_LABEL: Record<HeadDir, { label: string; cue: string; emoji: string }> = {
  left: { label: 'LOOK LEFT', cue: 'Turn your head to the left!', emoji: '👈' },
  right: { label: 'LOOK RIGHT', cue: 'Turn your head to the right!', emoji: '👉' },
  up: { label: 'LOOK UP', cue: 'Lift your head up to the sky!', emoji: '👆' },
  down: { label: 'LOOK DOWN', cue: 'Tip your head down low!', emoji: '👇' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Session 4 — Static Balance helpers (single-leg stance + balance quality)
// ─────────────────────────────────────────────────────────────────────────────

export type LegStance = {
  /** Which foot is lifted, or 'none' for two-foot stance. */
  lifted: 'left' | 'right' | 'none';
  /** 0..1 confidence/amount of the lift. */
  amount: number;
  /** Whether both ankles were confidently visible this frame. */
  legsVisible: boolean;
};

const LEG_LIFT_MIN = 0.45; // ankle height diff (in shoulder-widths) to count as a lift

/**
 * Detect a single-leg stance from ankle heights. A lifted foot sits higher
 * (smaller y) than the planted foot. Returns legsVisible:false when the legs
 * are off-frame so games can fall back to a stillness-based balance hold.
 */
export function legLift(m: PostureMetrics): LegStance {
  if (!m.present || !m.leftAnkle || !m.rightAnkle) {
    return { lifted: 'none', amount: 0, legsVisible: false };
  }
  const diff = Math.abs(m.leftAnkle.y - m.rightAnkle.y);
  const norm = diff / Math.max(0.08, m.shoulderWidth);
  if (norm < LEG_LIFT_MIN) return { lifted: 'none', amount: clamp01(norm / 1.1), legsVisible: true };
  const lifted = m.leftAnkle.y < m.rightAnkle.y ? 'left' : 'right';
  return { lifted, amount: clamp01(norm / 1.1), legsVisible: true };
}

/**
 * Overall static-balance quality 0..1: blends upright posture with low body
 * sway. `motion` is a whole-body motion magnitude (see frameMotionFull).
 */
export function balanceQuality(m: PostureMetrics, base: PostureBaseline, motion: number): number {
  if (!m.present) return 0;
  const up = uprightScore(m, base);
  const still = swayStillness(motion);
  return clamp01(up * 0.45 + still * 0.55);
}

/** Whether the arms are extended out/up (Star Balance Hold). */
export function armsExtended(m: PostureMetrics, threshold = 0.4): boolean {
  return armRaise(m) >= threshold;
}

/** Standing pose prompts for Balance Statue (verbal cues, scored by stillness). */
export const BALANCE_POSES: { label: string; cue: string; emoji: string }[] = [
  { label: 'STAR POSE', cue: 'Arms out wide like a star!', emoji: '⭐' },
  { label: 'TALL TREE', cue: 'Hands together high above your head!', emoji: '🌳' },
  { label: 'HERO POSE', cue: 'Hands on your hips, stand strong!', emoji: '🦸' },
  { label: 'AIRPLANE', cue: 'Arms out wide — steady wings!', emoji: '✈️' },
  { label: 'ROCKET', cue: 'One arm up high to the sky!', emoji: '🚀' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Session 5 — Weight Shifting helpers (center-of-mass shift + lean direction)
// ─────────────────────────────────────────────────────────────────────────────

/** Body center of mass (normalized screen coords) — hips weighted over shoulders. */
export function centerOfMass(m: PostureMetrics): Point {
  if (!m.present) return { x: 0.5, y: 0.6 };
  return {
    x: m.hipMid.x * 0.55 + m.shoulderMid.x * 0.45,
    y: m.hipMid.y * 0.55 + m.shoulderMid.y * 0.45,
  };
}

/**
 * Weight-shift offset of the center of mass from the calibrated center,
 * in shoulder-width units. x is MIRRORED to match the selfie preview, so a
 * positive x means the child shifted to their right (screen right).
 */
export function weightShift(m: PostureMetrics, base: PostureBaseline): Point {
  if (!m.present) return { x: 0, y: 0 };
  const c = centerOfMass(m);
  const sw = Math.max(0.08, m.shoulderWidth);
  return {
    x: -(c.x - base.comX) / sw, // mirror horizontal
    y: (c.y - base.comY) / sw,
  };
}

export type ShiftDir = 'left' | 'right' | 'center';

const SHIFT_TOL = 0.26; // shoulder-widths of lateral shift to register a side

/** Which lateral zone the (already-mirrored) weight-shift x falls into. */
export function shiftZone(shiftX: number, tol = SHIFT_TOL): ShiftDir {
  if (shiftX <= -tol) return 'left';
  if (shiftX >= tol) return 'right';
  return 'center';
}

/**
 * Dynamic-balance score 0..1 for weight-shifting games. Unlike uprightScore,
 * it tolerates intentional lean and only penalizes collapsing shoulders and
 * extreme/uncontrolled trunk lean (loss of balance).
 */
export function weightBalanceScore(m: PostureMetrics, base: PostureBaseline): number {
  if (!m.present) return 0;
  const EXTREME_LEAN = 38;
  const dShoulder = Math.abs(m.shoulderTiltDeg - base.shoulderTiltDeg) / 28;
  const dLean = Math.max(0, Math.abs(m.trunkLeanDeg - base.trunkLeanDeg) - 22) / EXTREME_LEAN;
  return clamp01(1 - (dShoulder * 0.5 + dLean * 0.5));
}

/** A 3-stone bridge step pattern (lateral markers to shift across). */
export const BRIDGE_PATTERN: ShiftDir[] = ['left', 'center', 'right', 'center', 'left', 'center', 'right'];

// ─────────────────────────────────────────────────────────────────────────────
// Session 6 — Dynamic Balance helpers (body turn + stepping actions)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Body-turn proxy 0..1. Turning the torso sideways foreshortens the apparent
 * shoulder width vs the calibrated forward-facing baseline. 0 = facing forward,
 * 1 = strongly turned.
 */
export function turnProxy(m: PostureMetrics, base: PostureBaseline): number {
  if (!m.present) return 0;
  const baseW = Math.max(0.08, base.shoulderWidthBase);
  return clamp01((baseW - m.shoulderWidth) / (baseW * 0.5));
}

/** Discrete dynamic-balance actions used by Session 6 sequence games. */
export type DynamicAction = 'left' | 'right' | 'center' | 'turn' | 'stop' | 'go' | 'steady';

export const DYNAMIC_ACTION_INFO: Record<DynamicAction, { label: string; cue: string; emoji: string }> = {
  left: { label: 'STEP LEFT', cue: 'Step onto the left stone!', emoji: '⬅️' },
  right: { label: 'STEP RIGHT', cue: 'Step onto the right stone!', emoji: '➡️' },
  center: { label: 'STEP MIDDLE', cue: 'Step onto the middle stone!', emoji: '⬆️' },
  turn: { label: 'TURN!', cue: 'Turn your body to the side!', emoji: '🔄' },
  stop: { label: 'STOP & BALANCE', cue: 'Freeze and balance — stay still!', emoji: '✋' },
  go: { label: 'MARCH!', cue: 'March and move your body!', emoji: '🏃' },
  steady: { label: 'STEADY STEP', cue: 'Balance, then take a careful step!', emoji: '🦶' },
};

/** Adventure Trail scripted action sequence (mixed dynamic-balance skills). */
export const ADVENTURE_TRAIL: DynamicAction[] = ['right', 'turn', 'left', 'stop', 'right', 'go', 'center'];

/** Balance Journey grand-course sequence (longer, mixed skills). */
export const BALANCE_JOURNEY: DynamicAction[] = [
  'right', 'left', 'turn', 'stop', 'center', 'right', 'turn', 'go', 'left', 'stop',
];

// ─────────────────────────────────────────────────────────────────────────────
// Session 7 — Trunk Rotation & Reaching helpers (wrist reach + cross-midline)
// ─────────────────────────────────────────────────────────────────────────────

export type ReachInfo = {
  /** Mirrored horizontal offset of each wrist from body midline (shoulder-widths). */
  leftX: number | null;
  rightX: number | null;
  /** The further-reaching wrist's offset and which hand it is. */
  domX: number;
  domHand: 'left' | 'right' | null;
};

/**
 * Reaching info from wrist positions. Offsets are MIRRORED so a positive value
 * means the hand is on the child's right (screen right). The "dominant" wrist
 * is the one reaching furthest from the body midline.
 */
export function reachInfo(m: PostureMetrics): ReachInfo {
  if (!m.present) return { leftX: null, rightX: null, domX: 0, domHand: null };
  const sw = Math.max(0.08, m.shoulderWidth);
  const cx = m.shoulderMid.x;
  const lx = m.leftWrist ? -(m.leftWrist.x - cx) / sw : null;
  const rx = m.rightWrist ? -(m.rightWrist.x - cx) / sw : null;
  let domX = 0;
  let domHand: 'left' | 'right' | null = null;
  if (lx !== null && Math.abs(lx) > Math.abs(domX)) {
    domX = lx;
    domHand = 'left';
  }
  if (rx !== null && Math.abs(rx) > Math.abs(domX)) {
    domX = rx;
    domHand = 'right';
  }
  return { leftX: lx, rightX: rx, domX, domHand };
}

const REACH_TOL = 0.55; // mirrored shoulder-widths to register a side reach

/** Which side a (mirrored) reach offset falls into. */
export function reachZoneOf(x: number, tol = REACH_TOL): ShiftDir {
  if (x <= -tol) return 'left';
  if (x >= tol) return 'right';
  return 'center';
}

/**
 * Whether a given hand has crossed the body midline (cross-midline reach).
 * The right hand's home is the right side, so it is "crossed" when it reaches
 * onto the left side, and vice-versa.
 */
export function isCrossBody(hand: 'left' | 'right', x: number, margin = 0.18): boolean {
  if (hand === 'right') return x <= -margin;
  return x >= margin;
}

/** Find a wrist currently reaching into the target side; returns the hand or null. */
export function handInZone(info: ReachInfo, side: ShiftDir, tol = REACH_TOL): 'left' | 'right' | null {
  if (info.leftX !== null && reachZoneOf(info.leftX, tol) === side) return 'left';
  if (info.rightX !== null && reachZoneOf(info.rightX, tol) === side) return 'right';
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Session 8 — Animal Walks & Core Activation helpers (quadruped pose + cadence)
// ─────────────────────────────────────────────────────────────────────────────

const UPRIGHT_TORSO_R = 1.25; // shoulder→hip vertical span / shoulder width when upright

/**
 * How "lowered" the body is toward an animal/quadruped position, 0..1.
 * Upright sitting/standing has a tall vertical torso span; bending onto hands &
 * feet (bear, crab, seal, turtle) foreshortens that span, pushing this toward 1.
 * Self-normalizing (uses shoulder width), so it needs no calibration baseline.
 */
export function bodyLowered(m: PostureMetrics): number {
  if (!m.present) return 0;
  const vspan = m.hipMid.y - m.shoulderMid.y; // positive when shoulders sit above hips
  const r = vspan / Math.max(0.08, m.shoulderWidth);
  return clamp01((UPRIGHT_TORSO_R - r) / UPRIGHT_TORSO_R);
}

/**
 * Whole-body limb motion magnitude for animal-walk cadence detection — sums the
 * frame-to-frame displacement of torso, head, wrists AND ankles so crawling,
 * pushing and marching all register strongly.
 */
export function limbMotion(prev: PostureMetrics | null, cur: PostureMetrics): number {
  if (!prev || !prev.present || !cur.present) return 0;
  let d = frameMotionFull(prev, cur, true);
  if (prev.leftAnkle && cur.leftAnkle)
    d += Math.hypot(cur.leftAnkle.x - prev.leftAnkle.x, cur.leftAnkle.y - prev.leftAnkle.y);
  if (prev.rightAnkle && cur.rightAnkle)
    d += Math.hypot(cur.rightAnkle.x - prev.rightAnkle.x, cur.rightAnkle.y - prev.rightAnkle.y);
  if (prev.leftKnee && cur.leftKnee)
    d += Math.hypot(cur.leftKnee.x - prev.leftKnee.x, cur.leftKnee.y - prev.leftKnee.y);
  if (prev.rightKnee && cur.rightKnee)
    d += Math.hypot(cur.rightKnee.x - prev.rightKnee.x, cur.rightKnee.y - prev.rightKnee.y);
  return d;
}

/** Normalize a limb-motion magnitude into an intensity 0..1 (1 = vigorous). */
export function movementIntensity(motion: number, ceiling = 0.16): number {
  return clamp01(motion / ceiling);
}

// ─────────────────────────────────────────────────────────────────────────────
// Session 9 — Postural Endurance helpers (sustained-hold pose quality)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Airplane pose: arms held out wide to the sides at roughly shoulder height.
 * Returns 0..1 — high when both wrists are spread far horizontally from the
 * shoulder midline AND kept level with the shoulders (not drooping or raised).
 */
export function armSpread(m: PostureMetrics): number {
  if (!m.present || !m.leftWrist || !m.rightWrist) return 0;
  const sw = Math.max(0.08, m.shoulderWidth);
  const lx = Math.abs(m.leftWrist.x - m.shoulderMid.x) / sw;
  const rx = Math.abs(m.rightWrist.x - m.shoulderMid.x) / sw;
  const spread = (lx + rx) / 2; // ~1.4+ when arms stretched wide
  const ly = Math.abs(m.leftWrist.y - m.shoulderMid.y) / sw;
  const ry = Math.abs(m.rightWrist.y - m.shoulderMid.y) / sw;
  const levelness = clamp01(1 - (ly + ry) / 2 / 1.1); // 1 when wrists at shoulder height
  return clamp01(spread / 1.4) * (0.55 + 0.45 * levelness);
}

/**
 * Generic endurance-hold quality 0..1 for a named pose. Blends the relevant
 * existing signals so the Postural Endurance engine can score any of its holds.
 * `motion` is a whole-body motion magnitude (see frameMotionFull).
 */
export type HoldPose = 'superhero' | 'airplane' | 'bridge' | 'tree' | 'statue';

export function holdQuality(
  pose: HoldPose,
  m: PostureMetrics,
  base: PostureBaseline,
  motion: number,
): number {
  if (!m.present) return 0;
  const up = uprightScore(m, base);
  const still = swayStillness(motion);
  switch (pose) {
    case 'superhero':
      return clamp01(up * 0.7 + still * 0.3);
    case 'airplane':
      return clamp01(armSpread(m) * 0.45 + up * 0.3 + still * 0.25);
    case 'bridge':
      return clamp01(bodyLowered(m) * 0.45 + still * 0.4 + up * 0.15);
    case 'tree':
      return clamp01(up * 0.55 + still * 0.45);
    case 'statue':
      return clamp01(still * 0.7 + up * 0.3);
  }
}
