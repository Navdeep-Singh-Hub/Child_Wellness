/**
 * OT Level 9 · Session 3 — Joint Position Awareness pose math.
 * Reads shoulder raise and elbow bend from MediaPipe landmarks (normalized 0..1).
 */
import type { Point, PostureMetrics } from '@/components/game/occupational/level6/session1/poseUtils';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const RAD2DEG = 180 / Math.PI;

/** Interior angle at joint B formed by segments A–B and B–C (degrees). */
export function interiorAngleDeg(a: Point, b: Point, c: Point): number {
  const bax = a.x - b.x;
  const bay = a.y - b.y;
  const bcx = c.x - b.x;
  const bcy = c.y - b.y;
  const mag = Math.hypot(bax, bay) * Math.hypot(bcx, bcy);
  if (mag < 1e-6) return 180;
  const cos = Math.max(-1, Math.min(1, (bax * bcx + bay * bcy) / mag));
  return Math.acos(cos) * RAD2DEG;
}

export type ArmJoints = { raise: number; elbow: number };

/** Shoulder raise (0=low, 1=high) and elbow bend (0=straight, 1=flexed). */
export function readArmJoints(
  shoulder: Point | null,
  elbow: Point | null,
  wrist: Point | null,
  shoulderWidth: number,
): ArmJoints | null {
  if (!shoulder || !elbow || !wrist) return null;
  const sw = Math.max(0.08, shoulderWidth);
  const raise = clamp01((shoulder.y - wrist.y) / sw / 1.05 + 0.1);
  const angle = interiorAngleDeg(shoulder, elbow, wrist);
  const elbowBend = clamp01((180 - angle) / 125);
  return { raise, elbow: elbowBend };
}

export type RobotArmPose = {
  id: string;
  name: string;
  icon: string;
  leftRaise: number;
  rightRaise: number;
  leftElbow: number;
  rightElbow: number;
};

/** Eight robot arm calibration poses — varied joint targets. */
export const ROBOT_ARM_POSES: RobotArmPose[] = [
  { id: 'salute', name: 'Robot Salute', icon: '🫡', leftRaise: 0.82, rightRaise: 0.12, leftElbow: 0.52, rightElbow: 0.18 },
  { id: 'power', name: 'Power Up', icon: '⚡', leftRaise: 0.88, rightRaise: 0.88, leftElbow: 0.22, rightElbow: 0.22 },
  { id: 'box', name: 'Circuit Box', icon: '📦', leftRaise: 0.48, rightRaise: 0.48, leftElbow: 0.72, rightElbow: 0.72 },
  { id: 'wave-l', name: 'Wave Left', icon: '👋', leftRaise: 0.78, rightRaise: 0.28, leftElbow: 0.58, rightElbow: 0.35 },
  { id: 'wave-r', name: 'Wave Right', icon: '🤚', leftRaise: 0.26, rightRaise: 0.8, leftElbow: 0.32, rightElbow: 0.55 },
  { id: 'flex', name: 'Flex Mode', icon: '💪', leftRaise: 0.55, rightRaise: 0.55, leftElbow: 0.85, rightElbow: 0.85 },
  { id: 'point', name: 'Laser Point', icon: '🔦', leftRaise: 0.42, rightRaise: 0.15, leftElbow: 0.48, rightElbow: 0.2 },
  { id: 'celebrate', name: 'Victory Arms', icon: '🎉', leftRaise: 0.92, rightRaise: 0.92, leftElbow: 0.62, rightElbow: 0.62 },
];

export type RobotJointReadout = {
  left: ArmJoints | null;
  right: ArmJoints | null;
};

export function readRobotJoints(m: PostureMetrics): RobotJointReadout {
  const sw = m.shoulderWidth;
  return {
    left: readArmJoints(m.leftShoulder, m.leftElbow, m.leftWrist, sw),
    right: readArmJoints(m.rightShoulder, m.rightElbow, m.rightWrist, sw),
  };
}

export function jointAxisAccuracy(actual: number, target: number, tolerance: number): number {
  const delta = Math.abs(actual - target);
  return clamp01(1 - delta / Math.max(tolerance, 0.08));
}

export type RobotMatch = {
  ok: boolean;
  score: number;
  leftRaiseAcc: number;
  rightRaiseAcc: number;
  leftElbowAcc: number;
  rightElbowAcc: number;
  joints: RobotJointReadout;
};

/** Score how well current arm joints match a robot pose target. */
export function matchRobotPose(m: PostureMetrics, target: RobotArmPose, tolerance: number): RobotMatch {
  const joints = readRobotJoints(m);
  if (!joints.left || !joints.right || !m.present) {
    return { ok: false, score: 0, leftRaiseAcc: 0, rightRaiseAcc: 0, leftElbowAcc: 0, rightElbowAcc: 0, joints };
  }

  const lr = jointAxisAccuracy(joints.left.raise, target.leftRaise, tolerance);
  const rr = jointAxisAccuracy(joints.right.raise, target.rightRaise, tolerance);
  const le = jointAxisAccuracy(joints.left.elbow, target.leftElbow, tolerance);
  const re = jointAxisAccuracy(joints.right.elbow, target.rightElbow, tolerance);
  const score = clamp01(lr * 0.28 + rr * 0.28 + le * 0.22 + re * 0.22);
  const ok = lr >= 0.82 && rr >= 0.82 && le >= 0.78 && re >= 0.78;

  return { ok, score, leftRaiseAcc: lr, rightRaiseAcc: rr, leftElbowAcc: le, rightElbowAcc: re, joints };
}

/** Mirrored joint positions for on-screen hand/arm markers. */
export function mirroredJointMarkers(m: PostureMetrics): {
  leftElbow: Point | null;
  rightElbow: Point | null;
  leftWrist: Point | null;
  rightWrist: Point | null;
} {
  const mx = (p: Point | null) => (p ? { x: 1 - p.x, y: p.y } : null);
  return {
    leftElbow: mx(m.leftElbow),
    rightElbow: mx(m.rightElbow),
    leftWrist: mx(m.leftWrist),
    rightWrist: mx(m.rightWrist),
  };
}

export type LegJoints = { lift: number; knee: number };

/** Knee lift (0=low, 1=high march) and knee bend (0=straight, 1=flexed). */
export function readLegJoints(
  hip: Point | null,
  knee: Point | null,
  ankle: Point | null,
  shoulderWidth: number,
): LegJoints | null {
  if (!hip || !knee || !ankle) return null;
  const sw = Math.max(0.08, shoulderWidth);
  const thighLen = Math.max(0.12, (knee.y - hip.y) / sw);
  const lift = clamp01(1 - thighLen / 1.05);
  const angle = interiorAngleDeg(hip, knee, ankle);
  const kneeBend = clamp01((180 - angle) / 125);
  return { lift, knee: kneeBend };
}

export type LegPoseTarget = {
  id: string;
  name: string;
  icon: string;
  leftLift: number;
  rightLift: number;
  leftKnee: number;
  rightKnee: number;
};

/** Eight mech leg poses — varied knee lift and bend targets. */
export const LEG_POSE_TARGETS: LegPoseTarget[] = [
  { id: 'guard', name: 'Stand Guard', icon: '🛡️', leftLift: 0.08, rightLift: 0.08, leftKnee: 0.1, rightKnee: 0.1 },
  { id: 'march-l', name: 'Left March', icon: '🦵', leftLift: 0.72, rightLift: 0.12, leftKnee: 0.38, rightKnee: 0.12 },
  { id: 'march-r', name: 'Right March', icon: '🦵', leftLift: 0.12, rightLift: 0.74, leftKnee: 0.12, rightKnee: 0.4 },
  { id: 'squat', name: 'Power Squat', icon: '⬇️', leftLift: 0.22, rightLift: 0.22, leftKnee: 0.78, rightKnee: 0.78 },
  { id: 'lunge-l', name: 'Left Lunge', icon: '🏃', leftLift: 0.18, rightLift: 0.52, leftKnee: 0.68, rightKnee: 0.28 },
  { id: 'lunge-r', name: 'Right Lunge', icon: '🏃', leftLift: 0.5, rightLift: 0.16, leftKnee: 0.26, rightKnee: 0.7 },
  { id: 'chair', name: 'Chair Hold', icon: '🪑', leftLift: 0.28, rightLift: 0.28, leftKnee: 0.58, rightKnee: 0.58 },
  { id: 'double', name: 'Double Lift', icon: '⚡', leftLift: 0.62, rightLift: 0.64, leftKnee: 0.42, rightKnee: 0.42 },
];

export type LegJointReadout = {
  left: LegJoints | null;
  right: LegJoints | null;
};

export function readLegJointReadout(m: PostureMetrics): LegJointReadout {
  const sw = m.shoulderWidth;
  return {
    left: readLegJoints(m.leftHip, m.leftKnee, m.leftAnkle, sw),
    right: readLegJoints(m.rightHip, m.rightKnee, m.rightAnkle, sw),
  };
}

export type LegMatch = {
  ok: boolean;
  score: number;
  leftLiftAcc: number;
  rightLiftAcc: number;
  leftKneeAcc: number;
  rightKneeAcc: number;
  joints: LegJointReadout;
};

/** Score how well current leg joints match a mech leg pose target. */
export function matchLegPose(m: PostureMetrics, target: LegPoseTarget, tolerance: number): LegMatch {
  const joints = readLegJointReadout(m);
  if (!joints.left || !joints.right || !m.present) {
    return { ok: false, score: 0, leftLiftAcc: 0, rightLiftAcc: 0, leftKneeAcc: 0, rightKneeAcc: 0, joints };
  }

  const ll = jointAxisAccuracy(joints.left.lift, target.leftLift, tolerance);
  const rl = jointAxisAccuracy(joints.right.lift, target.rightLift, tolerance);
  const lk = jointAxisAccuracy(joints.left.knee, target.leftKnee, tolerance);
  const rk = jointAxisAccuracy(joints.right.knee, target.rightKnee, tolerance);
  const score = clamp01(ll * 0.28 + rl * 0.28 + lk * 0.22 + rk * 0.22);
  const ok = ll >= 0.8 && rl >= 0.8 && lk >= 0.76 && rk >= 0.76;

  return { ok, score, leftLiftAcc: ll, rightLiftAcc: rl, leftKneeAcc: lk, rightKneeAcc: rk, joints };
}

/** Mirrored leg joint markers for on-screen overlay. */
export function mirroredLegMarkers(m: PostureMetrics): {
  leftKnee: Point | null;
  rightKnee: Point | null;
  leftAnkle: Point | null;
  rightAnkle: Point | null;
} {
  const mx = (p: Point | null) => (p ? { x: 1 - p.x, y: p.y } : null);
  return {
    leftKnee: mx(m.leftKnee),
    rightKnee: mx(m.rightKnee),
    leftAnkle: mx(m.leftAnkle),
    rightAnkle: mx(m.rightAnkle),
  };
}

export type FullBodyPoseTarget = {
  id: string;
  name: string;
  icon: string;
  leftRaise: number;
  rightRaise: number;
  leftElbow: number;
  rightElbow: number;
  leftLift: number;
  rightLift: number;
  leftKnee: number;
  rightKnee: number;
};

/** Eight mirror full-body poses — arms + legs combined. */
export const COPY_POSE_TARGETS: FullBodyPoseTarget[] = [
  {
    id: 'star',
    name: 'Star Reach',
    icon: '⭐',
    leftRaise: 0.9,
    rightRaise: 0.9,
    leftElbow: 0.18,
    rightElbow: 0.18,
    leftLift: 0.1,
    rightLift: 0.1,
    leftKnee: 0.12,
    rightKnee: 0.12,
  },
  {
    id: 'squat-reach',
    name: 'Squat Reach',
    icon: '⬇️',
    leftRaise: 0.55,
    rightRaise: 0.55,
    leftElbow: 0.45,
    rightElbow: 0.45,
    leftLift: 0.2,
    rightLift: 0.2,
    leftKnee: 0.75,
    rightKnee: 0.75,
  },
  {
    id: 'march-point',
    name: 'March & Point',
    icon: '👋',
    leftRaise: 0.35,
    rightRaise: 0.72,
    leftElbow: 0.4,
    rightElbow: 0.55,
    leftLift: 0.68,
    rightLift: 0.12,
    leftKnee: 0.4,
    rightKnee: 0.14,
  },
  {
    id: 'victory',
    name: 'Victory Stance',
    icon: '🏆',
    leftRaise: 0.85,
    rightRaise: 0.85,
    leftElbow: 0.35,
    rightElbow: 0.35,
    leftLift: 0.15,
    rightLift: 0.15,
    leftKnee: 0.35,
    rightKnee: 0.35,
  },
  {
    id: 'ninja',
    name: 'Ninja Lunge',
    icon: '🥷',
    leftRaise: 0.78,
    rightRaise: 0.2,
    leftElbow: 0.5,
    rightElbow: 0.22,
    leftLift: 0.22,
    rightLift: 0.55,
    leftKnee: 0.55,
    rightKnee: 0.3,
  },
  {
    id: 't-rex',
    name: 'T-Rex Stance',
    icon: '🦖',
    leftRaise: 0.42,
    rightRaise: 0.42,
    leftElbow: 0.78,
    rightElbow: 0.78,
    leftLift: 0.18,
    rightLift: 0.18,
    leftKnee: 0.62,
    rightKnee: 0.62,
  },
  {
    id: 'tree',
    name: 'Tree Balance',
    icon: '🌳',
    leftRaise: 0.72,
    rightRaise: 0.72,
    leftElbow: 0.28,
    rightElbow: 0.28,
    leftLift: 0.7,
    rightLift: 0.1,
    leftKnee: 0.45,
    rightKnee: 0.12,
  },
  {
    id: 'hero',
    name: 'Hero Landing',
    icon: '🦸',
    leftRaise: 0.48,
    rightRaise: 0.48,
    leftElbow: 0.55,
    rightElbow: 0.55,
    leftLift: 0.25,
    rightLift: 0.25,
    leftKnee: 0.82,
    rightKnee: 0.82,
  },
];

export type FullBodyReadout = {
  arms: RobotJointReadout;
  legs: LegJointReadout;
};

export function readFullBodyReadout(m: PostureMetrics): FullBodyReadout {
  return { arms: readRobotJoints(m), legs: readLegJointReadout(m) };
}

export type FullBodyMatch = {
  ok: boolean;
  score: number;
  armsScore: number;
  legsScore: number;
  readout: FullBodyReadout;
};

/** Score full-body pose copy — arms (50%) + legs (50%). */
export function matchFullBodyPose(m: PostureMetrics, target: FullBodyPoseTarget, tolerance: number): FullBodyMatch {
  const readout = readFullBodyReadout(m);
  const armMatch = matchRobotPose(
    m,
    {
      id: target.id,
      name: target.name,
      icon: target.icon,
      leftRaise: target.leftRaise,
      rightRaise: target.rightRaise,
      leftElbow: target.leftElbow,
      rightElbow: target.rightElbow,
    },
    tolerance,
  );
  const legMatch = matchLegPose(
    m,
    {
      id: target.id,
      name: target.name,
      icon: target.icon,
      leftLift: target.leftLift,
      rightLift: target.rightLift,
      leftKnee: target.leftKnee,
      rightKnee: target.rightKnee,
    },
    tolerance,
  );

  if (!readout.arms.left || !readout.arms.right || !readout.legs.left || !readout.legs.right || !m.present) {
    return { ok: false, score: 0, armsScore: 0, legsScore: 0, readout };
  }

  const armsScore = armMatch.score;
  const legsScore = legMatch.score;
  const score = clamp01(armsScore * 0.5 + legsScore * 0.5);
  const ok = armMatch.ok && legMatch.ok;

  return { ok, score, armsScore, legsScore, readout };
}

/** Mirrored full-body joint markers. */
export function mirroredBodyMarkers(m: PostureMetrics): {
  leftElbow: Point | null;
  rightElbow: Point | null;
  leftWrist: Point | null;
  rightWrist: Point | null;
  leftKnee: Point | null;
  rightKnee: Point | null;
  leftAnkle: Point | null;
  rightAnkle: Point | null;
} {
  const arms = mirroredJointMarkers(m);
  const legs = mirroredLegMarkers(m);
  return { ...arms, ...legs };
}

/** Swap left/right joint targets — what the child must do to mirror the displayed pose. */
export function flipPoseSides(target: FullBodyPoseTarget): FullBodyPoseTarget {
  return {
    ...target,
    leftRaise: target.rightRaise,
    rightRaise: target.leftRaise,
    leftElbow: target.rightElbow,
    rightElbow: target.leftElbow,
    leftLift: target.rightLift,
    rightLift: target.leftLift,
    leftKnee: target.rightKnee,
    rightKnee: target.leftKnee,
  };
}

/** Eight asymmetric reflection poses — designed for opposite-side mirroring. */
export const MIRROR_BODY_TARGETS: FullBodyPoseTarget[] = [
  {
    id: 'wave-left',
    name: 'Left Wave',
    icon: '👋',
    leftRaise: 0.82,
    rightRaise: 0.18,
    leftElbow: 0.55,
    rightElbow: 0.2,
    leftLift: 0.1,
    rightLift: 0.1,
    leftKnee: 0.12,
    rightKnee: 0.12,
  },
  {
    id: 'point-right',
    name: 'Right Point',
    icon: '👉',
    leftRaise: 0.15,
    rightRaise: 0.78,
    leftElbow: 0.18,
    rightElbow: 0.48,
    leftLift: 0.1,
    rightLift: 0.1,
    leftKnee: 0.12,
    rightKnee: 0.12,
  },
  {
    id: 'march-left',
    name: 'Left March',
    icon: '🦵',
    leftRaise: 0.35,
    rightRaise: 0.35,
    leftElbow: 0.3,
    rightElbow: 0.3,
    leftLift: 0.72,
    rightLift: 0.1,
    leftKnee: 0.42,
    rightKnee: 0.12,
  },
  {
    id: 'kick-right',
    name: 'Right Kick',
    icon: '🦶',
    leftRaise: 0.3,
    rightRaise: 0.3,
    leftElbow: 0.28,
    rightElbow: 0.28,
    leftLift: 0.1,
    rightLift: 0.7,
    leftKnee: 0.12,
    rightKnee: 0.45,
  },
  {
    id: 'salute-left',
    name: 'Left Salute',
    icon: '🫡',
    leftRaise: 0.88,
    rightRaise: 0.12,
    leftElbow: 0.52,
    rightElbow: 0.18,
    leftLift: 0.15,
    rightLift: 0.15,
    leftKnee: 0.2,
    rightKnee: 0.2,
  },
  {
    id: 'reach-right',
    name: 'Right Reach',
    icon: '🌟',
    leftRaise: 0.2,
    rightRaise: 0.9,
    leftElbow: 0.22,
    rightElbow: 0.2,
    leftLift: 0.12,
    rightLift: 0.12,
    leftKnee: 0.14,
    rightKnee: 0.14,
  },
  {
    id: 'lunge-left',
    name: 'Left Lunge',
    icon: '🏃',
    leftRaise: 0.45,
    rightRaise: 0.45,
    leftElbow: 0.4,
    rightElbow: 0.4,
    leftLift: 0.18,
    rightLift: 0.55,
    leftKnee: 0.68,
    rightKnee: 0.28,
  },
  {
    id: 'cross-arm',
    name: 'Cross Arm',
    icon: '✖️',
    leftRaise: 0.72,
    rightRaise: 0.22,
    leftElbow: 0.62,
    rightElbow: 0.35,
    leftLift: 0.55,
    rightLift: 0.12,
    leftKnee: 0.38,
    rightKnee: 0.14,
  },
];

export type MirroredBodyMatch = FullBodyMatch & {
  expectedPose: FullBodyPoseTarget;
};

/** Score opposite-side body mirroring — child must flip left/right vs displayed pose. */
export function matchMirroredBodyPose(
  m: PostureMetrics,
  displayTarget: FullBodyPoseTarget,
  tolerance: number,
): MirroredBodyMatch {
  const expectedPose = flipPoseSides(displayTarget);
  const result = matchFullBodyPose(m, expectedPose, tolerance);
  return { ...result, expectedPose };
}

export type PositionAxis =
  | 'leftRaise'
  | 'rightRaise'
  | 'leftElbow'
  | 'rightElbow'
  | 'leftLift'
  | 'rightLift'
  | 'leftKnee'
  | 'rightKnee';

export type PositionMatchTarget = {
  id: string;
  name: string;
  icon: string;
  focus: PositionAxis[];
  leftRaise: number;
  rightRaise: number;
  leftElbow: number;
  rightElbow: number;
  leftLift: number;
  rightLift: number;
  leftKnee: number;
  rightKnee: number;
};

const AXIS_LABELS: Record<PositionAxis, string> = {
  leftRaise: 'L Shoulder',
  rightRaise: 'R Shoulder',
  leftElbow: 'L Elbow',
  rightElbow: 'R Elbow',
  leftLift: 'L Knee Lift',
  rightLift: 'R Knee Lift',
  leftKnee: 'L Knee Bend',
  rightKnee: 'R Knee Bend',
};

export function positionAxisLabel(axis: PositionAxis): string {
  return AXIS_LABELS[axis];
}

function readAxisValue(readout: FullBodyReadout, axis: PositionAxis): number | null {
  switch (axis) {
    case 'leftRaise':
      return readout.arms.left?.raise ?? null;
    case 'rightRaise':
      return readout.arms.right?.raise ?? null;
    case 'leftElbow':
      return readout.arms.left?.elbow ?? null;
    case 'rightElbow':
      return readout.arms.right?.elbow ?? null;
    case 'leftLift':
      return readout.legs.left?.lift ?? null;
    case 'rightLift':
      return readout.legs.right?.lift ?? null;
    case 'leftKnee':
      return readout.legs.left?.knee ?? null;
    case 'rightKnee':
      return readout.legs.right?.knee ?? null;
  }
}

function targetAxisValue(target: PositionMatchTarget, axis: PositionAxis): number {
  return target[axis];
}

/** Eight precision grid challenges — focused joint subsets per round. */
export const POSITION_MATCH_TARGETS: PositionMatchTarget[] = [
  {
    id: 'shoulders',
    name: 'Shoulder Grid',
    icon: '🙌',
    focus: ['leftRaise', 'rightRaise'],
    leftRaise: 0.78,
    rightRaise: 0.78,
    leftElbow: 0.3,
    rightElbow: 0.3,
    leftLift: 0.1,
    rightLift: 0.1,
    leftKnee: 0.12,
    rightKnee: 0.12,
  },
  {
    id: 'elbows',
    name: 'Elbow Grid',
    icon: '💪',
    focus: ['leftElbow', 'rightElbow'],
    leftRaise: 0.45,
    rightRaise: 0.45,
    leftElbow: 0.72,
    rightElbow: 0.72,
    leftLift: 0.1,
    rightLift: 0.1,
    leftKnee: 0.12,
    rightKnee: 0.12,
  },
  {
    id: 'knees',
    name: 'Knee Bend Grid',
    icon: '🦵',
    focus: ['leftKnee', 'rightKnee'],
    leftRaise: 0.35,
    rightRaise: 0.35,
    leftElbow: 0.3,
    rightElbow: 0.3,
    leftLift: 0.15,
    rightLift: 0.15,
    leftKnee: 0.68,
    rightKnee: 0.68,
  },
  {
    id: 'lifts',
    name: 'Leg Lift Grid',
    icon: '⚡',
    focus: ['leftLift', 'rightLift'],
    leftRaise: 0.35,
    rightRaise: 0.35,
    leftElbow: 0.28,
    rightElbow: 0.28,
    leftLift: 0.62,
    rightLift: 0.62,
    leftKnee: 0.35,
    rightKnee: 0.35,
  },
  {
    id: 'left-arm',
    name: 'Left Arm Lock',
    icon: '🤚',
    focus: ['leftRaise', 'leftElbow'],
    leftRaise: 0.82,
    rightRaise: 0.25,
    leftElbow: 0.55,
    rightElbow: 0.22,
    leftLift: 0.1,
    rightLift: 0.1,
    leftKnee: 0.12,
    rightKnee: 0.12,
  },
  {
    id: 'right-leg',
    name: 'Right Leg Lock',
    icon: '🦶',
    focus: ['rightLift', 'rightKnee'],
    leftRaise: 0.3,
    rightRaise: 0.3,
    leftElbow: 0.25,
    rightElbow: 0.25,
    leftLift: 0.12,
    rightLift: 0.7,
    leftKnee: 0.14,
    rightKnee: 0.48,
  },
  {
    id: 'cross-lock',
    name: 'Cross Grid',
    icon: '✖️',
    focus: ['leftRaise', 'rightKnee', 'rightLift', 'leftElbow'],
    leftRaise: 0.75,
    rightRaise: 0.3,
    leftElbow: 0.58,
    rightElbow: 0.25,
    leftLift: 0.55,
    rightLift: 0.15,
    leftKnee: 0.35,
    rightKnee: 0.62,
  },
  {
    id: 'full-grid',
    name: 'Full Grid Lock',
    icon: '🎯',
    focus: ['leftRaise', 'rightRaise', 'leftElbow', 'rightElbow', 'leftLift', 'rightLift', 'leftKnee', 'rightKnee'],
    leftRaise: 0.55,
    rightRaise: 0.72,
    leftElbow: 0.48,
    rightElbow: 0.55,
    leftLift: 0.58,
    rightLift: 0.14,
    leftKnee: 0.42,
    rightKnee: 0.16,
  },
];

export type AxisPositionScore = {
  axis: PositionAxis;
  label: string;
  actual: number;
  target: number;
  accuracy: number;
  focused: boolean;
};

export type PositionMatchResult = {
  ok: boolean;
  score: number;
  readout: FullBodyReadout;
  axes: AxisPositionScore[];
  worstAxis: PositionAxis | null;
};

/** Score focused joint positions on the calibration grid — only highlighted axes count. */
export function matchPositionTargets(
  m: PostureMetrics,
  target: PositionMatchTarget,
  tolerance: number,
): PositionMatchResult {
  const readout = readFullBodyReadout(m);
  const focusSet = new Set(target.focus);

  const axes: AxisPositionScore[] = (
    [
      'leftRaise',
      'rightRaise',
      'leftElbow',
      'rightElbow',
      'leftLift',
      'rightLift',
      'leftKnee',
      'rightKnee',
    ] as PositionAxis[]
  ).map((axis) => {
    const actual = readAxisValue(readout, axis) ?? 0;
    const tgt = targetAxisValue(target, axis);
    const accuracy = jointAxisAccuracy(actual, tgt, tolerance);
    return {
      axis,
      label: positionAxisLabel(axis),
      actual,
      target: tgt,
      accuracy,
      focused: focusSet.has(axis),
    };
  });

  if (!m.present || !readout.arms.left || !readout.arms.right || !readout.legs.left || !readout.legs.right) {
    return { ok: false, score: 0, readout, axes, worstAxis: null };
  }

  const focused = axes.filter((a) => a.focused);
  if (focused.length === 0) {
    return { ok: false, score: 0, readout, axes, worstAxis: null };
  }

  const score = clamp01(focused.reduce((s, a) => s + a.accuracy, 0) / focused.length);
  const ok = focused.every((a) => a.accuracy >= 0.84);
  const worst = focused.reduce((w, a) => (a.accuracy < w.accuracy ? a : w), focused[0]!);

  return { ok, score, readout, axes, worstAxis: worst.axis };
}
