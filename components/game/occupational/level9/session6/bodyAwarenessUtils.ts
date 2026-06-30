/**
 * OT Level 9 · Session 6 — Body Awareness pose math.
 * Progressive body assembly matching + controlled placement effort.
 */
import {
  uprightScore,
  type PostureBaseline,
  type PostureMetrics,
} from '@/components/game/occupational/level6/session1/poseUtils';
import {
  forwardPressScore,
  squeezeScore,
  type ForceBaseline,
} from '@/components/game/occupational/level9/session1/forceUtils';
import {
  matchFullBodyPose,
  readLegJointReadout,
  readRobotJoints,
  type FullBodyPoseTarget,
  type FullBodyReadout,
} from '@/components/game/occupational/level9/session3/jointUtils';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export type ResistanceZoneStatus = 'light' | 'zone' | 'heavy';

export function bodyZoneStatus(power: number, target: number, bandHalf: number): ResistanceZoneStatus {
  if (power < target - bandHalf) return 'light';
  if (power > target + bandHalf) return 'heavy';
  return 'zone';
}

export type BodySegment = 'trunk' | 'arms' | 'legs';

export type BodyBuildRound = {
  id: string;
  name: string;
  icon: string;
  segmentLabel: string;
  highlight: BodySegment;
  segments: BodySegment[];
  target: FullBodyPoseTarget;
};

/** Eight progressive body-build rounds — trunk → arms → legs assembly. */
export const BUILD_BODY_ROUNDS: BodyBuildRound[] = [
  {
    id: 'foundation',
    name: 'Foundation Stand',
    icon: '🏗️',
    segmentLabel: 'TRUNK',
    highlight: 'trunk',
    segments: ['trunk'],
    target: {
      id: 'foundation',
      name: 'Foundation Stand',
      icon: '🏗️',
      leftRaise: 0.12,
      rightRaise: 0.12,
      leftElbow: 0.15,
      rightElbow: 0.15,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
  },
  {
    id: 'head-lock',
    name: 'Head Lock',
    icon: '🙂',
    segmentLabel: 'HEAD',
    highlight: 'trunk',
    segments: ['trunk'],
    target: {
      id: 'head-lock',
      name: 'Head Lock',
      icon: '🙂',
      leftRaise: 0.1,
      rightRaise: 0.1,
      leftElbow: 0.12,
      rightElbow: 0.12,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
  },
  {
    id: 'arm-beams',
    name: 'Arm Beams',
    icon: '💪',
    segmentLabel: 'ARMS',
    highlight: 'arms',
    segments: ['trunk', 'arms'],
    target: {
      id: 'arm-beams',
      name: 'Arm Beams',
      icon: '💪',
      leftRaise: 0.72,
      rightRaise: 0.72,
      leftElbow: 0.2,
      rightElbow: 0.2,
      leftLift: 0.1,
      rightLift: 0.1,
      leftKnee: 0.12,
      rightKnee: 0.12,
    },
  },
  {
    id: 'torso-shield',
    name: 'Torso Shield',
    icon: '🛡️',
    segmentLabel: 'CHEST',
    highlight: 'arms',
    segments: ['trunk', 'arms'],
    target: {
      id: 'torso-shield',
      name: 'Torso Shield',
      icon: '🛡️',
      leftRaise: 0.48,
      rightRaise: 0.48,
      leftElbow: 0.68,
      rightElbow: 0.68,
      leftLift: 0.1,
      rightLift: 0.1,
      leftKnee: 0.14,
      rightKnee: 0.14,
    },
  },
  {
    id: 'leg-pillars',
    name: 'Leg Pillars',
    icon: '🦵',
    segmentLabel: 'LEGS',
    highlight: 'legs',
    segments: ['trunk', 'arms', 'legs'],
    target: {
      id: 'leg-pillars',
      name: 'Leg Pillars',
      icon: '🦵',
      leftRaise: 0.42,
      rightRaise: 0.42,
      leftElbow: 0.35,
      rightElbow: 0.35,
      leftLift: 0.18,
      rightLift: 0.18,
      leftKnee: 0.62,
      rightKnee: 0.62,
    },
  },
  {
    id: 'power-reach',
    name: 'Power Reach',
    icon: '🙌',
    segmentLabel: 'REACH',
    highlight: 'arms',
    segments: ['trunk', 'arms', 'legs'],
    target: {
      id: 'power-reach',
      name: 'Power Reach',
      icon: '🙌',
      leftRaise: 0.82,
      rightRaise: 0.28,
      leftElbow: 0.42,
      rightElbow: 0.3,
      leftLift: 0.14,
      rightLift: 0.14,
      leftKnee: 0.28,
      rightKnee: 0.28,
    },
  },
  {
    id: 'balance-step',
    name: 'Balance Step',
    icon: '👣',
    segmentLabel: 'STEP',
    highlight: 'legs',
    segments: ['trunk', 'arms', 'legs'],
    target: {
      id: 'balance-step',
      name: 'Balance Step',
      icon: '👣',
      leftRaise: 0.38,
      rightRaise: 0.68,
      leftElbow: 0.38,
      rightElbow: 0.52,
      leftLift: 0.62,
      rightLift: 0.12,
      leftKnee: 0.42,
      rightKnee: 0.14,
    },
  },
  {
    id: 'complete-body',
    name: 'Complete Body',
    icon: '🌟',
    segmentLabel: 'FULL',
    highlight: 'trunk',
    segments: ['trunk', 'arms', 'legs'],
    target: {
      id: 'complete-body',
      name: 'Complete Body',
      icon: '🌟',
      leftRaise: 0.88,
      rightRaise: 0.88,
      leftElbow: 0.32,
      rightElbow: 0.32,
      leftLift: 0.16,
      rightLift: 0.16,
      leftKnee: 0.38,
      rightKnee: 0.38,
    },
  },
];

export type BuildBodyMatch = {
  ok: boolean;
  score: number;
  trunkScore: number;
  armsScore: number;
  legsScore: number;
  readout: FullBodyReadout;
};

/** Weighted segment match for progressive body assembly. */
export function buildBodyMatchScore(
  m: PostureMetrics,
  round: BodyBuildRound,
  base: PostureBaseline,
  tolerance: number,
): BuildBodyMatch {
  const full = matchFullBodyPose(m, round.target, tolerance);
  const trunk = uprightScore(m, base);

  const weight = { trunk: 0, arms: 0, legs: 0 };
  for (const s of round.segments) weight[s] += 1;
  const totalW = weight.trunk + weight.arms + weight.legs || 1;

  let score = 0;
  if (weight.trunk) score += trunk * (weight.trunk / totalW);
  if (weight.arms) score += full.armsScore * (weight.arms / totalW);
  if (weight.legs) score += full.legsScore * (weight.legs / totalW);

  const blended = clamp01(score);
  const highlightMin =
    round.highlight === 'trunk' ? trunk : round.highlight === 'arms' ? full.armsScore : full.legsScore;
  const ok = blended >= 0.72 && highlightMin >= 0.65;

  return {
    ok,
    score: blended,
    trunkScore: trunk,
    armsScore: full.armsScore,
    legsScore: full.legsScore,
    readout: full.readout,
  };
}

/** Controlled placement effort — steady hold with moderate engagement. */
export function placementForceScore(
  m: PostureMetrics,
  base: ForceBaseline,
  controlled: number,
  matchScore: number,
): number {
  const squeeze = squeezeScore(m, base);
  const idealSqueeze = 0.32;
  const squeezeBand = clamp01(1 - Math.abs(squeeze - idealSqueeze) / 0.34);
  const forward = forwardPressScore(m, base);
  const engagement = clamp01(squeezeBand * 0.42 + forward * 0.18 + matchScore * 0.4);
  return clamp01(controlled * 0.58 + engagement * 0.42);
}

/**
 * Build body power — segment pose match + controlled placement effort.
 * Uses absolute normalized landmark coordinates vs calibrated baseline.
 */
export function buildBodyPowerScore(
  m: PostureMetrics,
  round: BodyBuildRound,
  postureBase: PostureBaseline,
  forceBase: ForceBaseline,
  tolerance: number,
  controlled: number,
): number {
  const match = buildBodyMatchScore(m, round, postureBase, tolerance);
  const placement = placementForceScore(m, forceBase, controlled, match.score);
  return clamp01(match.score * 0.56 + placement * 0.44);
}

/** Mirrored body markers for segment placement preview. */
export { mirroredBodyMarkers } from '@/components/game/occupational/level9/session3/jointUtils';

export type TouchHand = 'left' | 'right' | 'either';

export type TouchPartId =
  | 'head'
  | 'left-shoulder'
  | 'right-shoulder'
  | 'chest'
  | 'left-knee'
  | 'right-knee'
  | 'left-hip'
  | 'belly';

export type TouchPartRound = {
  id: TouchPartId;
  name: string;
  icon: string;
  label: string;
  hand: TouchHand;
  crossBody: boolean;
};

/** Eight guided body-part touch rounds — cross-body and lower-body reaches. */
export const TOUCH_PART_ROUNDS: TouchPartRound[] = [
  { id: 'head', name: 'Touch Head', icon: '🙂', label: 'HEAD', hand: 'either', crossBody: false },
  { id: 'left-shoulder', name: 'Left Shoulder', icon: '💪', label: 'LEFT SHOULDER', hand: 'right', crossBody: true },
  { id: 'right-shoulder', name: 'Right Shoulder', icon: '💪', label: 'RIGHT SHOULDER', hand: 'left', crossBody: true },
  { id: 'chest', name: 'Touch Chest', icon: '🫁', label: 'CHEST', hand: 'either', crossBody: false },
  { id: 'left-knee', name: 'Left Knee', icon: '🦵', label: 'LEFT KNEE', hand: 'left', crossBody: false },
  { id: 'right-knee', name: 'Right Knee', icon: '🦵', label: 'RIGHT KNEE', hand: 'right', crossBody: false },
  { id: 'left-hip', name: 'Left Hip', icon: '🦴', label: 'LEFT HIP', hand: 'left', crossBody: false },
  { id: 'belly', name: 'Touch Belly', icon: '🌟', label: 'BELLY', hand: 'either', crossBody: false },
];

export type TouchPartPoint = { x: number; y: number };

/** Landmark anchor for each touch target. */
export function touchPartPoint(m: PostureMetrics, part: TouchPartId): TouchPartPoint | null {
  const sm = m.shoulderMid;
  const hm = m.hipMid;
  const sw = Math.max(0.12, m.shoulderWidth);
  switch (part) {
    case 'head':
      return m.nose ?? { x: sm.x, y: sm.y - sw * 0.42 };
    case 'left-shoulder':
      return m.leftShoulder;
    case 'right-shoulder':
      return m.rightShoulder;
    case 'chest':
      return { x: sm.x, y: sm.y + (hm.y - sm.y) * 0.38 };
    case 'left-knee':
      return m.leftKnee;
    case 'right-knee':
      return m.rightKnee;
    case 'left-hip':
      return m.leftHip;
    case 'belly':
      return { x: sm.x, y: sm.y + (hm.y - sm.y) * 0.62 };
    default:
      return null;
  }
}

function wristDistNorm(wrist: TouchPartPoint, target: TouchPartPoint, shoulderWidth: number): number {
  const sw = Math.max(0.12, shoulderWidth);
  return Math.hypot(wrist.x - target.x, wrist.y - target.y) / sw;
}

/** Pick active touching hand for the round. */
export function activeTouchHand(m: PostureMetrics, round: TouchPartRound): TouchPartPoint | null {
  const target = touchPartPoint(m, round.id);
  if (!target) return null;
  if (round.hand === 'left') return m.leftWrist;
  if (round.hand === 'right') return m.rightWrist;
  if (!m.leftWrist && !m.rightWrist) return null;
  if (!m.leftWrist) return m.rightWrist;
  if (!m.rightWrist) return m.leftWrist;
  const dl = wristDistNorm(m.leftWrist, target, m.shoulderWidth);
  const dr = wristDistNorm(m.rightWrist, target, m.shoulderWidth);
  return dl <= dr ? m.leftWrist : m.rightWrist;
}

/** Whether the designated hand is closer than the off hand. */
export function correctHandUsed(m: PostureMetrics, round: TouchPartRound): boolean {
  if (round.hand === 'either') return true;
  const target = touchPartPoint(m, round.id);
  if (!target || !m.leftWrist || !m.rightWrist) return !!activeTouchHand(m, round);
  const dl = wristDistNorm(m.leftWrist, target, m.shoulderWidth);
  const dr = wristDistNorm(m.rightWrist, target, m.shoulderWidth);
  return round.hand === 'left' ? dl <= dr * 1.08 : dr <= dl * 1.08;
}

/** Wrist proximity to target landmark (0..1). */
export function touchProximityScore(m: PostureMetrics, round: TouchPartRound, radiusNorm: number): number {
  const target = touchPartPoint(m, round.id);
  const hand = activeTouchHand(m, round);
  if (!target || !hand) return 0;
  const dist = wristDistNorm(hand, target, m.shoulderWidth);
  const prox = clamp01(1 - dist / Math.max(0.18, radiusNorm));
  const handBonus = correctHandUsed(m, round) ? 1 : 0.72;
  return clamp01(prox * handBonus);
}

/** Controlled touch effort at contact — gentle squeeze + steady reach. */
export function touchForceScore(
  m: PostureMetrics,
  base: ForceBaseline,
  controlled: number,
  proximity: number,
): number {
  const squeeze = squeezeScore(m, base);
  const idealSqueeze = 0.28;
  const gentle = clamp01(1 - Math.abs(squeeze - idealSqueeze) / 0.32);
  const forward = forwardPressScore(m, base);
  const contact = clamp01(proximity * 0.62 + gentle * 0.24 + forward * 0.14);
  return clamp01(controlled * 0.54 + contact * 0.46);
}

/** Combined touch power for effort zone matching. */
export function touchPartPowerScore(
  m: PostureMetrics,
  round: TouchPartRound,
  base: ForceBaseline,
  radiusNorm: number,
  controlled: number,
): number {
  const proximity = touchProximityScore(m, round, radiusNorm);
  const force = touchForceScore(m, base, controlled, proximity);
  return clamp01(proximity * 0.58 + force * 0.42);
}

export function mirroredTouchHand(m: PostureMetrics, round: TouchPartRound): TouchPartPoint | null {
  const hand = activeTouchHand(m, round);
  return hand ? { x: 1 - hand.x, y: hand.y } : null;
}

export function mirroredTouchTarget(m: PostureMetrics, round: TouchPartRound): TouchPartPoint | null {
  const pt = touchPartPoint(m, round.id);
  return pt ? { x: 1 - pt.x, y: pt.y } : null;
}

export type BodyMapZoneId =
  | 'head-crown'
  | 'shoulder-bridge'
  | 'left-arm-trail'
  | 'right-arm-trail'
  | 'core-center'
  | 'left-leg-path'
  | 'right-leg-path'
  | 'full-atlas';

export type BodyMapZoneRound = {
  id: BodyMapZoneId;
  name: string;
  icon: string;
  label: string;
  /** Vertical position on silhouette (0 = top). */
  mapSlot: number;
};

/** Eight top-to-bottom body map zone scans. */
export const BODY_MAP_ZONES: BodyMapZoneRound[] = [
  { id: 'head-crown', name: 'Head Crown', icon: '🙂', label: 'HEAD ZONE', mapSlot: 0 },
  { id: 'shoulder-bridge', name: 'Shoulder Bridge', icon: '💪', label: 'SHOULDER ZONE', mapSlot: 1 },
  { id: 'left-arm-trail', name: 'Left Arm Trail', icon: '🦾', label: 'LEFT ARM ZONE', mapSlot: 2 },
  { id: 'right-arm-trail', name: 'Right Arm Trail', icon: '🦾', label: 'RIGHT ARM ZONE', mapSlot: 3 },
  { id: 'core-center', name: 'Core Center', icon: '🫁', label: 'CORE ZONE', mapSlot: 4 },
  { id: 'left-leg-path', name: 'Left Leg Path', icon: '🦵', label: 'LEFT LEG ZONE', mapSlot: 5 },
  { id: 'right-leg-path', name: 'Right Leg Path', icon: '🦵', label: 'RIGHT LEG ZONE', mapSlot: 6 },
  { id: 'full-atlas', name: 'Full Atlas', icon: '🌟', label: 'FULL MAP', mapSlot: 7 },
];

/** Head crown zone — stable head alignment vs baseline. */
export function headMapZoneScore(m: PostureMetrics, base: PostureBaseline): number {
  const tilt = clamp01(1 - Math.abs(m.headTiltDeg - base.headTiltDeg) / 12);
  const offset = clamp01(1 - Math.abs(m.headOffsetNorm - base.headOffsetNorm) / 0.22);
  const upright = uprightScore(m, base);
  return clamp01(tilt * 0.42 + offset * 0.38 + upright * 0.2);
}

/** Shoulder bridge zone — level shoulders with light bilateral raise. */
export function shoulderMapZoneScore(m: PostureMetrics, base: PostureBaseline): number {
  const level = clamp01(1 - Math.abs(m.shoulderTiltDeg - base.shoulderTiltDeg) / 14);
  const joints = readRobotJoints(m);
  if (!joints.left || !joints.right) return level * 0.6;
  const raiseAvg = (joints.left.raise + joints.right.raise) / 2;
  const raise = clamp01(1 - Math.abs(raiseAvg - 0.38) / 0.26);
  return clamp01(level * 0.52 + raise * 0.48);
}

/** Left arm trail zone — isolated left arm raise. */
export function leftArmMapZoneScore(m: PostureMetrics): number {
  const joints = readRobotJoints(m);
  if (!joints.left) return 0;
  const raise = clamp01(1 - Math.abs(joints.left.raise - 0.64) / 0.28);
  const elbow = clamp01(1 - Math.abs(joints.left.elbow - 0.26) / 0.28);
  return clamp01(raise * 0.56 + elbow * 0.44);
}

/** Right arm trail zone — isolated right arm raise. */
export function rightArmMapZoneScore(m: PostureMetrics): number {
  const joints = readRobotJoints(m);
  if (!joints.right) return 0;
  const raise = clamp01(1 - Math.abs(joints.right.raise - 0.64) / 0.28);
  const elbow = clamp01(1 - Math.abs(joints.right.elbow - 0.26) / 0.28);
  return clamp01(raise * 0.56 + elbow * 0.44);
}

/** Core center zone — upright trunk lock. */
export function coreMapZoneScore(m: PostureMetrics, base: PostureBaseline): number {
  const upright = uprightScore(m, base);
  const lean = clamp01(1 - Math.abs(m.trunkLeanDeg - base.trunkLeanDeg) / 12);
  const level = clamp01(1 - Math.abs(m.shoulderTiltDeg - base.shoulderTiltDeg) / 14);
  return clamp01(upright * 0.48 + lean * 0.32 + level * 0.2);
}

/** Left leg path zone — isolated left knee lift. */
export function leftLegMapZoneScore(m: PostureMetrics): number {
  const legs = readLegJointReadout(m);
  if (!legs.left) return 0;
  const lift = clamp01(1 - Math.abs(legs.left.lift - 0.5) / 0.28);
  const knee = clamp01(1 - Math.abs(legs.left.knee - 0.34) / 0.3);
  return clamp01(lift * 0.56 + knee * 0.44);
}

/** Right leg path zone — isolated right knee lift. */
export function rightLegMapZoneScore(m: PostureMetrics): number {
  const legs = readLegJointReadout(m);
  if (!legs.right) return 0;
  const lift = clamp01(1 - Math.abs(legs.right.lift - 0.5) / 0.28);
  const knee = clamp01(1 - Math.abs(legs.right.knee - 0.34) / 0.3);
  return clamp01(lift * 0.56 + knee * 0.44);
}

/** Full atlas zone — integrated head, core, arms and legs awareness. */
export function fullAtlasMapZoneScore(m: PostureMetrics, base: PostureBaseline): number {
  const head = headMapZoneScore(m, base);
  const core = coreMapZoneScore(m, base);
  const lArm = leftArmMapZoneScore(m);
  const rArm = rightArmMapZoneScore(m);
  const lLeg = leftLegMapZoneScore(m);
  const rLeg = rightLegMapZoneScore(m);
  const arms = clamp01((lArm + rArm) / 2);
  const legs = clamp01((lLeg + rLeg) / 2);
  return clamp01(head * 0.18 + core * 0.28 + arms * 0.28 + legs * 0.26);
}

/** Regional zone activation for the current map scan round. */
export function bodyMapZoneScore(m: PostureMetrics, round: BodyMapZoneRound, base: PostureBaseline): number {
  switch (round.id) {
    case 'head-crown':
      return headMapZoneScore(m, base);
    case 'shoulder-bridge':
      return shoulderMapZoneScore(m, base);
    case 'left-arm-trail':
      return leftArmMapZoneScore(m);
    case 'right-arm-trail':
      return rightArmMapZoneScore(m);
    case 'core-center':
      return coreMapZoneScore(m, base);
    case 'left-leg-path':
      return leftLegMapZoneScore(m);
    case 'right-leg-path':
      return rightLegMapZoneScore(m);
    case 'full-atlas':
      return fullAtlasMapZoneScore(m, base);
    default:
      return 0;
  }
}

/** Controlled mapping effort while holding regional zone activation. */
export function mappingEffortScore(
  m: PostureMetrics,
  base: ForceBaseline,
  controlled: number,
  zoneActivation: number,
): number {
  const squeeze = squeezeScore(m, base);
  const idealSqueeze = 0.3;
  const steady = clamp01(1 - Math.abs(squeeze - idealSqueeze) / 0.34);
  const forward = forwardPressScore(m, base);
  const engage = clamp01(zoneActivation * 0.5 + steady * 0.3 + forward * 0.2);
  return clamp01(controlled * 0.56 + engage * 0.44);
}

/** Body map power — regional zone activation + controlled mapping effort. */
export function bodyMapPowerScore(
  m: PostureMetrics,
  round: BodyMapZoneRound,
  postureBase: PostureBaseline,
  forceBase: ForceBaseline,
  controlled: number,
): number {
  const zone = bodyMapZoneScore(m, round, postureBase);
  const effort = mappingEffortScore(m, forceBase, controlled, zone);
  return clamp01(zone * 0.58 + effort * 0.42);
}

export type HeroPoseRound = {
  id: string;
  name: string;
  icon: string;
  label: string;
  target: FullBodyPoseTarget;
};

/** Eight iconic hero poses — full-body champion stances. */
export const HERO_POSE_ROUNDS: HeroPoseRound[] = [
  {
    id: 'guardian-stand',
    name: 'Guardian Stand',
    icon: '🛡️',
    label: 'GUARDIAN',
    target: {
      id: 'guardian-stand',
      name: 'Guardian Stand',
      icon: '🛡️',
      leftRaise: 0.22,
      rightRaise: 0.22,
      leftElbow: 0.2,
      rightElbow: 0.2,
      leftLift: 0.14,
      rightLift: 0.14,
      leftKnee: 0.28,
      rightKnee: 0.28,
    },
  },
  {
    id: 'power-fists',
    name: 'Power Fists',
    icon: '💪',
    label: 'POWER FISTS',
    target: {
      id: 'power-fists',
      name: 'Power Fists',
      icon: '💪',
      leftRaise: 0.44,
      rightRaise: 0.44,
      leftElbow: 0.78,
      rightElbow: 0.78,
      leftLift: 0.16,
      rightLift: 0.16,
      leftKnee: 0.38,
      rightKnee: 0.38,
    },
  },
  {
    id: 'hero-reach',
    name: 'Hero Reach',
    icon: '🙌',
    label: 'HERO REACH',
    target: {
      id: 'hero-reach',
      name: 'Hero Reach',
      icon: '🙌',
      leftRaise: 0.86,
      rightRaise: 0.32,
      leftElbow: 0.3,
      rightElbow: 0.35,
      leftLift: 0.12,
      rightLift: 0.12,
      leftKnee: 0.24,
      rightKnee: 0.24,
    },
  },
  {
    id: 'cape-spread',
    name: 'Cape Spread',
    icon: '🦸',
    label: 'CAPE SPREAD',
    target: {
      id: 'cape-spread',
      name: 'Cape Spread',
      icon: '🦸',
      leftRaise: 0.88,
      rightRaise: 0.88,
      leftElbow: 0.16,
      rightElbow: 0.16,
      leftLift: 0.12,
      rightLift: 0.12,
      leftKnee: 0.18,
      rightKnee: 0.18,
    },
  },
  {
    id: 'champion-squat',
    name: 'Champion Squat',
    icon: '⬇️',
    label: 'CHAMPION SQUAT',
    target: {
      id: 'champion-squat',
      name: 'Champion Squat',
      icon: '⬇️',
      leftRaise: 0.52,
      rightRaise: 0.52,
      leftElbow: 0.48,
      rightElbow: 0.48,
      leftLift: 0.2,
      rightLift: 0.2,
      leftKnee: 0.76,
      rightKnee: 0.76,
    },
  },
  {
    id: 'lightning-victory',
    name: 'Lightning Victory',
    icon: '⚡',
    label: 'LIGHTNING',
    target: {
      id: 'lightning-victory',
      name: 'Lightning Victory',
      icon: '⚡',
      leftRaise: 0.92,
      rightRaise: 0.92,
      leftElbow: 0.28,
      rightElbow: 0.28,
      leftLift: 0.14,
      rightLift: 0.14,
      leftKnee: 0.32,
      rightKnee: 0.32,
    },
  },
  {
    id: 'shield-lunge',
    name: 'Shield Lunge',
    icon: '🥷',
    label: 'SHIELD LUNGE',
    target: {
      id: 'shield-lunge',
      name: 'Shield Lunge',
      icon: '🥷',
      leftRaise: 0.74,
      rightRaise: 0.24,
      leftElbow: 0.48,
      rightElbow: 0.22,
      leftLift: 0.2,
      rightLift: 0.54,
      leftKnee: 0.52,
      rightKnee: 0.3,
    },
  },
  {
    id: 'ultimate-hero',
    name: 'Ultimate Hero',
    icon: '🌟',
    label: 'ULTIMATE',
    target: {
      id: 'ultimate-hero',
      name: 'Ultimate Hero',
      icon: '🌟',
      leftRaise: 0.9,
      rightRaise: 0.9,
      leftElbow: 0.34,
      rightElbow: 0.34,
      leftLift: 0.18,
      rightLift: 0.18,
      leftKnee: 0.4,
      rightKnee: 0.4,
    },
  },
];

/** Heroic power channeling — upright champion effort while holding pose. */
export function heroicEffortScore(
  m: PostureMetrics,
  postureBase: PostureBaseline,
  forceBase: ForceBaseline,
  controlled: number,
  poseMatch: number,
): number {
  const upright = uprightScore(m, postureBase);
  const forward = forwardPressScore(m, forceBase);
  const squeeze = squeezeScore(m, forceBase);
  const idealSqueeze = 0.34;
  const power = clamp01(1 - Math.abs(squeeze - idealSqueeze) / 0.36);
  const channel = clamp01(poseMatch * 0.42 + upright * 0.28 + forward * 0.18 + power * 0.12);
  return clamp01(controlled * 0.54 + channel * 0.46);
}

/** Hero pose match — full-body arms + legs. */
export function heroPoseMatchScore(
  m: PostureMetrics,
  round: HeroPoseRound,
  tolerance: number,
): { score: number; armsScore: number; legsScore: number; readout: FullBodyReadout } {
  const match = matchFullBodyPose(m, round.target, tolerance);
  return {
    score: match.score,
    armsScore: match.armsScore,
    legsScore: match.legsScore,
    readout: match.readout,
  };
}

/** Hero power — pose match + controlled heroic effort channeling. */
export function heroPowerScore(
  m: PostureMetrics,
  round: HeroPoseRound,
  postureBase: PostureBaseline,
  forceBase: ForceBaseline,
  tolerance: number,
  controlled: number,
): number {
  const match = heroPoseMatchScore(m, round, tolerance);
  const effort = heroicEffortScore(m, postureBase, forceBase, controlled, match.score);
  return clamp01(match.score * 0.56 + effort * 0.44);
}

export type RobotModule = 'core' | 'head' | 'armL' | 'armR' | 'torso' | 'legL' | 'legR' | 'full';

export type RobotBuildRound = {
  id: string;
  name: string;
  icon: string;
  moduleLabel: string;
  highlight: RobotModule;
  modules: RobotModule[];
  target: FullBodyPoseTarget;
};

/** Eight progressive robot module installs — stiff mechanical calibration poses. */
export const ROBOT_BUILD_ROUNDS: RobotBuildRound[] = [
  {
    id: 'power-core',
    name: 'Power Core',
    icon: '⚡',
    moduleLabel: 'CORE',
    highlight: 'core',
    modules: ['core'],
    target: {
      id: 'power-core',
      name: 'Power Core',
      icon: '⚡',
      leftRaise: 0.08,
      rightRaise: 0.08,
      leftElbow: 0.12,
      rightElbow: 0.12,
      leftLift: 0.06,
      rightLift: 0.06,
      leftKnee: 0.08,
      rightKnee: 0.08,
    },
  },
  {
    id: 'head-unit',
    name: 'Head Unit',
    icon: '🤖',
    moduleLabel: 'HEAD',
    highlight: 'head',
    modules: ['core', 'head'],
    target: {
      id: 'head-unit',
      name: 'Head Unit',
      icon: '🤖',
      leftRaise: 0.1,
      rightRaise: 0.1,
      leftElbow: 0.14,
      rightElbow: 0.14,
      leftLift: 0.08,
      rightLift: 0.08,
      leftKnee: 0.1,
      rightKnee: 0.1,
    },
  },
  {
    id: 'left-servo',
    name: 'Left Servo Arm',
    icon: '🦾',
    moduleLabel: 'L-SERVO',
    highlight: 'armL',
    modules: ['core', 'head', 'armL'],
    target: {
      id: 'left-servo',
      name: 'Left Servo Arm',
      icon: '🦾',
      leftRaise: 0.78,
      rightRaise: 0.1,
      leftElbow: 0.82,
      rightElbow: 0.14,
      leftLift: 0.1,
      rightLift: 0.08,
      leftKnee: 0.12,
      rightKnee: 0.1,
    },
  },
  {
    id: 'right-servo',
    name: 'Right Servo Arm',
    icon: '🦾',
    moduleLabel: 'R-SERVO',
    highlight: 'armR',
    modules: ['core', 'head', 'armL', 'armR'],
    target: {
      id: 'right-servo',
      name: 'Right Servo Arm',
      icon: '🦾',
      leftRaise: 0.1,
      rightRaise: 0.78,
      leftElbow: 0.14,
      rightElbow: 0.82,
      leftLift: 0.08,
      rightLift: 0.1,
      leftKnee: 0.1,
      rightKnee: 0.12,
    },
  },
  {
    id: 'torso-frame',
    name: 'Torso Frame',
    icon: '🛡️',
    moduleLabel: 'TORSO',
    highlight: 'torso',
    modules: ['core', 'head', 'armL', 'armR', 'torso'],
    target: {
      id: 'torso-frame',
      name: 'Torso Frame',
      icon: '🛡️',
      leftRaise: 0.92,
      rightRaise: 0.92,
      leftElbow: 0.1,
      rightElbow: 0.1,
      leftLift: 0.1,
      rightLift: 0.1,
      leftKnee: 0.14,
      rightKnee: 0.14,
    },
  },
  {
    id: 'left-actuator',
    name: 'Left Leg Actuator',
    icon: '🦿',
    moduleLabel: 'L-LEG',
    highlight: 'legL',
    modules: ['core', 'head', 'armL', 'armR', 'torso', 'legL'],
    target: {
      id: 'left-actuator',
      name: 'Left Leg Actuator',
      icon: '🦿',
      leftRaise: 0.38,
      rightRaise: 0.38,
      leftElbow: 0.28,
      rightElbow: 0.28,
      leftLift: 0.58,
      rightLift: 0.1,
      leftKnee: 0.48,
      rightKnee: 0.12,
    },
  },
  {
    id: 'right-actuator',
    name: 'Right Leg Actuator',
    icon: '🦿',
    moduleLabel: 'R-LEG',
    highlight: 'legR',
    modules: ['core', 'head', 'armL', 'armR', 'torso', 'legL', 'legR'],
    target: {
      id: 'right-actuator',
      name: 'Right Leg Actuator',
      icon: '🦿',
      leftRaise: 0.38,
      rightRaise: 0.38,
      leftElbow: 0.28,
      rightElbow: 0.28,
      leftLift: 0.1,
      rightLift: 0.58,
      leftKnee: 0.12,
      rightKnee: 0.48,
    },
  },
  {
    id: 'full-robot',
    name: 'Full Robot',
    icon: '🌟',
    moduleLabel: 'COMPLETE',
    highlight: 'full',
    modules: ['core', 'head', 'armL', 'armR', 'torso', 'legL', 'legR', 'full'],
    target: {
      id: 'full-robot',
      name: 'Full Robot',
      icon: '🌟',
      leftRaise: 0.72,
      rightRaise: 0.72,
      leftElbow: 0.36,
      rightElbow: 0.36,
      leftLift: 0.16,
      rightLift: 0.16,
      leftKnee: 0.34,
      rightKnee: 0.34,
    },
  },
];

export type RobotModuleMatch = {
  ok: boolean;
  score: number;
  stiffness: number;
  armsScore: number;
  legsScore: number;
  readout: FullBodyReadout;
};

/** Mechanical joint stiffness — low variance between left/right symmetric joints. */
function robotStiffnessBonus(m: PostureMetrics, round: RobotBuildRound): number {
  const joints = readRobotJoints(m);
  const legs = readLegJointReadout(m);
  if (!joints.left || !joints.right) return 0.5;
  const armSym = clamp01(1 - Math.abs(joints.left.raise - joints.right.raise) / 0.22);
  const elbowSym = clamp01(1 - Math.abs(joints.left.elbow - joints.right.elbow) / 0.24);
  let legSym = 0.72;
  if (legs.left && legs.right) {
    legSym = clamp01(1 - Math.abs(legs.left.lift - legs.right.lift) / 0.26);
  }
  const isolated =
    round.highlight === 'armL' || round.highlight === 'armR' || round.highlight === 'legL' || round.highlight === 'legR';
  return isolated ? clamp01(armSym * 0.42 + elbowSym * 0.38 + legSym * 0.2) : clamp01(armSym * 0.5 + elbowSym * 0.5);
}

/** Progressive module match with mechanical stiffness weighting. */
export function robotModuleMatchScore(
  m: PostureMetrics,
  round: RobotBuildRound,
  postureBase: PostureBaseline,
  tolerance: number,
): RobotModuleMatch {
  const full = matchFullBodyPose(m, round.target, tolerance);
  const trunk = uprightScore(m, postureBase);
  const stiffness = robotStiffnessBonus(m, round);

  const weight = { core: 0, head: 0, armL: 0, armR: 0, torso: 0, legL: 0, legR: 0, full: 0 };
  for (const mod of round.modules) weight[mod] += 1;
  const totalW = Object.values(weight).reduce((a, b) => a + b, 0) || 1;

  let score = 0;
  if (weight.core || weight.head || weight.torso || weight.full) score += trunk * ((weight.core + weight.head + weight.torso + weight.full) / totalW);
  if (weight.armL || weight.armR || weight.full) score += full.armsScore * ((weight.armL + weight.armR + weight.full) / totalW);
  if (weight.legL || weight.legR || weight.full) score += full.legsScore * ((weight.legL + weight.legR + weight.full) / totalW);

  const blended = clamp01(score * 0.82 + stiffness * 0.18);
  const highlightMin =
    round.highlight === 'core' || round.highlight === 'head' || round.highlight === 'torso' || round.highlight === 'full'
      ? trunk
      : round.highlight === 'armL' || round.highlight === 'armR'
        ? full.armsScore
        : full.legsScore;
  const ok = blended >= 0.74 && highlightMin >= 0.66;

  return {
    ok,
    score: blended,
    stiffness,
    armsScore: full.armsScore,
    legsScore: full.legsScore,
    readout: full.readout,
  };
}

/** Controlled assembly torque — stiff isometric hold while bolting module. */
export function assemblyTorqueScore(
  m: PostureMetrics,
  base: ForceBaseline,
  controlled: number,
  moduleMatch: number,
  stiffness: number,
): number {
  const squeeze = squeezeScore(m, base);
  const idealSqueeze = 0.36;
  const torque = clamp01(1 - Math.abs(squeeze - idealSqueeze) / 0.32);
  const forward = forwardPressScore(m, base);
  const engage = clamp01(moduleMatch * 0.38 + stiffness * 0.22 + torque * 0.28 + forward * 0.12);
  return clamp01(controlled * 0.52 + engage * 0.48);
}

/** Robot build power — module pose match + controlled assembly torque. */
export function robotBuildPowerScore(
  m: PostureMetrics,
  round: RobotBuildRound,
  postureBase: PostureBaseline,
  forceBase: ForceBaseline,
  tolerance: number,
  controlled: number,
): number {
  const match = robotModuleMatchScore(m, round, postureBase, tolerance);
  const torque = assemblyTorqueScore(m, forceBase, controlled, match.score, match.stiffness);
  return clamp01(match.score * 0.54 + torque * 0.46);
}
