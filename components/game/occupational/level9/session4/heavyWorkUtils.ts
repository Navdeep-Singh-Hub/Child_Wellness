/**
 * OT Level 9 · Session 4 — Heavy Work Missions pose math.
 * Estimates carry pose form and sustained haul effort from MediaPipe landmarks.
 */
import {
  uprightScore,
  type PostureMetrics,
} from '@/components/game/occupational/level6/session1/poseUtils';
import { readLegJointReadout, readRobotJoints } from '@/components/game/occupational/level9/session3/jointUtils';
import {
  bilateralPushSymmetry,
  bilateralSqueezeSymmetry,
  forwardPressScore,
  rocketPushForceScore,
  type ForceBaseline,
  wristHeightMatch,
  wristSpreadNorm,
  squeezeScore,
} from '@/components/game/occupational/level9/session1/forceUtils';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export type CarryZoneStatus = 'light' | 'zone' | 'heavy';

export function carryZoneStatus(effort: number, target: number, bandHalf: number): CarryZoneStatus {
  if (effort < target - bandHalf) return 'light';
  if (effort > target + bandHalf) return 'heavy';
  return 'zone';
}

/** Elbows bent for box-carry (~55% flexion ideal). */
export function carryElbowBend(m: PostureMetrics): number {
  const joints = readRobotJoints(m);
  if (!joints.left || !joints.right) return 0;
  const avg = (joints.left.elbow + joints.right.elbow) / 2;
  const ideal = 0.55;
  return clamp01(1 - Math.abs(avg - ideal) / 0.32);
}

/** Wrists held at waist / mid-torso carry height. */
export function carryWristHeight(m: PostureMetrics): number {
  if (!m.leftWrist || !m.rightWrist) return 0;
  const sm = m.shoulderMid;
  const hm = m.hipMid;
  const carryY = sm.y + (hm.y - sm.y) * 0.52;
  const sw = Math.max(0.12, m.shoulderWidth);
  let sum = 0;
  let n = 0;
  for (const w of [m.leftWrist, m.rightWrist]) {
    sum += clamp01(1 - Math.abs(w.y - carryY) / (sw * 0.48));
    n++;
  }
  return n ? sum / n : 0;
}

/** Moderate hand spread — like gripping a treasure chest. */
export function carryBoxSpread(m: PostureMetrics, base: ForceBaseline): number {
  const spread = wristSpreadNorm(m);
  const ideal = base.wristSpreadNorm * 0.72;
  return clamp01(1 - Math.abs(spread - ideal) / Math.max(0.16, base.wristSpreadNorm * 0.36));
}

/** Carry pose form — arm position independent of effort level. */
export function carryPoseForm(m: PostureMetrics, base: ForceBaseline): number {
  const bend = carryElbowBend(m);
  const height = carryWristHeight(m);
  const spread = carryBoxSpread(m, base);
  const level = wristHeightMatch(m);
  const upright = uprightScore(m, base);
  return clamp01(bend * 0.32 + height * 0.3 + spread * 0.2 + level * 0.1 + upright * 0.08);
}

/**
 * Sustained carry effort — graded heavy-work output while holding carry pose.
 * Uses absolute normalized landmark coordinates vs calibrated baseline.
 */
export function carryEffortScore(m: PostureMetrics, base: ForceBaseline): number {
  const form = carryPoseForm(m, base);
  const squeeze = squeezeScore(m, base);
  const symmetry = bilateralSqueezeSymmetry(m);
  const upright = uprightScore(m, base);
  const engagement = clamp01(squeeze * 0.55 + symmetry * 0.25 + upright * 0.2);
  return clamp01(form * 0.55 + engagement * 0.45);
}

/** Mirrored carry-hand anchors for overlay. */
export function mirroredCarryHands(m: PostureMetrics): {
  left: { x: number; y: number } | null;
  right: { x: number; y: number } | null;
} {
  return {
    left: m.leftWrist ? { x: 1 - m.leftWrist.x, y: m.leftWrist.y } : null,
    right: m.rightWrist ? { x: 1 - m.rightWrist.x, y: m.rightWrist.y } : null,
  };
}

/** Extended arms for wall push (~20% elbow flexion ideal). */
export function wallPushArmExtension(m: PostureMetrics): number {
  const joints = readRobotJoints(m);
  if (!joints.left || !joints.right) return 0;
  const avg = (joints.left.elbow + joints.right.elbow) / 2;
  const ideal = 0.2;
  return clamp01(1 - Math.abs(avg - ideal) / 0.28);
}

/** Palms pushed forward at chest height. */
export function wallPushChestHeight(m: PostureMetrics): number {
  if (!m.leftWrist || !m.rightWrist) return 0;
  const sm = m.shoulderMid;
  const hm = m.hipMid;
  const pushY = sm.y + (hm.y - sm.y) * 0.38;
  const sw = Math.max(0.12, m.shoulderWidth);
  let sum = 0;
  let n = 0;
  for (const w of [m.leftWrist, m.rightWrist]) {
    sum += clamp01(1 - Math.abs(w.y - pushY) / (sw * 0.5));
    n++;
  }
  return n ? sum / n : 0;
}

/** Wall-push pose form — extended arms at chest push height. */
export function wallPushPoseForm(m: PostureMetrics, base: ForceBaseline): number {
  const extension = wallPushArmExtension(m);
  const height = wallPushChestHeight(m);
  const level = wristHeightMatch(m);
  const upright = uprightScore(m, base);
  const spread = carryBoxSpread(m, base);
  return clamp01(extension * 0.34 + height * 0.32 + level * 0.14 + spread * 0.12 + upright * 0.08);
}

/**
 * Sustained wall-push effort — bilateral forward thrust while holding push pose.
 * Uses absolute normalized landmark coordinates vs calibrated baseline.
 */
export function wallPushForceScore(m: PostureMetrics, base: ForceBaseline): number {
  const form = wallPushPoseForm(m, base);
  const thrust = rocketPushForceScore(m, base);
  const forward = forwardPressScore(m, base);
  const symmetry = bilateralPushSymmetry(m);
  const engagement = clamp01(thrust * 0.5 + forward * 0.3 + symmetry * 0.2);
  return clamp01(form * 0.42 + engagement * 0.58);
}

/** High shoulder raise for gorilla chest beat (~75% raise ideal). */
export function gorillaArmRaise(m: PostureMetrics): number {
  const joints = readRobotJoints(m);
  if (!joints.left || !joints.right) return 0;
  const avg = (joints.left.raise + joints.right.raise) / 2;
  const ideal = 0.75;
  return clamp01(1 - Math.abs(avg - ideal) / 0.3);
}

/** Wrists at upper-chest beat zone. */
export function gorillaBeatHeight(m: PostureMetrics): number {
  if (!m.leftWrist || !m.rightWrist) return 0;
  const sm = m.shoulderMid;
  const hm = m.hipMid;
  const beatY = sm.y + (hm.y - sm.y) * 0.32;
  const sw = Math.max(0.12, m.shoulderWidth);
  let sum = 0;
  let n = 0;
  for (const w of [m.leftWrist, m.rightWrist]) {
    sum += clamp01(1 - Math.abs(w.y - beatY) / (sw * 0.48));
    n++;
  }
  return n ? sum / n : 0;
}

/** Wide arm spread for gorilla power pose. */
export function gorillaArmSpread(m: PostureMetrics, base: ForceBaseline): number {
  const spread = wristSpreadNorm(m);
  const ideal = base.wristSpreadNorm * 0.95;
  return clamp01(1 - Math.abs(spread - ideal) / Math.max(0.18, base.wristSpreadNorm * 0.4));
}

/** Power stance — slight knee bend and stable legs. */
export function gorillaPowerStance(m: PostureMetrics): number {
  const legs = readLegJointReadout(m);
  if (!legs.left || !legs.right) return 0;
  const kneeAvg = (legs.left.knee + legs.right.knee) / 2;
  const liftAvg = (legs.left.lift + legs.right.lift) / 2;
  const kneeScore = clamp01(1 - Math.abs(kneeAvg - 0.38) / 0.28);
  const stableLift = clamp01(1 - Math.abs(liftAvg - 0.14) / 0.22);
  return clamp01(kneeScore * 0.62 + stableLift * 0.38);
}

/** Gorilla power pose — raised wide arms + power stance. */
export function gorillaPoseForm(m: PostureMetrics, base: ForceBaseline): number {
  const raise = gorillaArmRaise(m);
  const beat = gorillaBeatHeight(m);
  const spread = gorillaArmSpread(m, base);
  const stance = gorillaPowerStance(m);
  const joints = readRobotJoints(m);
  const elbowAvg = joints.left && joints.right ? (joints.left.elbow + joints.right.elbow) / 2 : 0;
  const elbowForBeat = clamp01(1 - Math.abs(elbowAvg - 0.48) / 0.3);
  const upright = uprightScore(m, base);
  return clamp01(raise * 0.26 + beat * 0.24 + spread * 0.16 + stance * 0.18 + elbowForBeat * 0.1 + upright * 0.06);
}

/**
 * Gorilla chest-beat power — raised arms + squeeze engagement + power stance.
 * Uses absolute normalized landmark coordinates vs calibrated baseline.
 */
export function gorillaPowerScore(m: PostureMetrics, base: ForceBaseline): number {
  const form = gorillaPoseForm(m, base);
  const squeeze = squeezeScore(m, base);
  const symmetry = bilateralSqueezeSymmetry(m);
  const stance = gorillaPowerStance(m);
  const engagement = clamp01(squeeze * 0.5 + symmetry * 0.3 + stance * 0.2);
  return clamp01(form * 0.48 + engagement * 0.52);
}

/** Mirrored gorilla beat hand anchors. */
export function mirroredGorillaHands(m: PostureMetrics): {
  left: { x: number; y: number } | null;
  right: { x: number; y: number } | null;
} {
  return mirroredCarryHands(m);
}

/** Engineer lever elbow bend (~42% flexion ideal). */
export function trainLeverBend(m: PostureMetrics): number {
  const joints = readRobotJoints(m);
  if (!joints.left || !joints.right) return 0;
  const avg = (joints.left.elbow + joints.right.elbow) / 2;
  const ideal = 0.42;
  return clamp01(1 - Math.abs(avg - ideal) / 0.28);
}

/** Wrists at engine lever height (mid-chest). */
export function trainLeverHeight(m: PostureMetrics): number {
  if (!m.leftWrist || !m.rightWrist) return 0;
  const sm = m.shoulderMid;
  const hm = m.hipMid;
  const leverY = sm.y + (hm.y - sm.y) * 0.44;
  const sw = Math.max(0.12, m.shoulderWidth);
  let sum = 0;
  let n = 0;
  for (const w of [m.leftWrist, m.rightWrist]) {
    sum += clamp01(1 - Math.abs(w.y - leverY) / (sw * 0.46));
    n++;
  }
  return n ? sum / n : 0;
}

/** Moderate lever grip spread — hands on dual engine controls. */
export function trainLeverSpread(m: PostureMetrics, base: ForceBaseline): number {
  const spread = wristSpreadNorm(m);
  const ideal = base.wristSpreadNorm * 0.68;
  return clamp01(1 - Math.abs(spread - ideal) / Math.max(0.15, base.wristSpreadNorm * 0.34));
}

/** Moderate shoulder raise for engineer pump (~40%). */
export function trainArmRaise(m: PostureMetrics): number {
  const joints = readRobotJoints(m);
  if (!joints.left || !joints.right) return 0;
  const avg = (joints.left.raise + joints.right.raise) / 2;
  const ideal = 0.4;
  return clamp01(1 - Math.abs(avg - ideal) / 0.28);
}

/** Engineer stance — planted legs, low knee bend. */
export function trainEngineStance(m: PostureMetrics): number {
  const legs = readLegJointReadout(m);
  if (!legs.left || !legs.right) return 0;
  const kneeAvg = (legs.left.knee + legs.right.knee) / 2;
  const liftAvg = (legs.left.lift + legs.right.lift) / 2;
  const kneeScore = clamp01(1 - Math.abs(kneeAvg - 0.22) / 0.24);
  const stableLift = clamp01(1 - Math.abs(liftAvg - 0.1) / 0.18);
  return clamp01(kneeScore * 0.58 + stableLift * 0.42);
}

/** Train engineer lever pose form. */
export function trainPoseForm(m: PostureMetrics, base: ForceBaseline): number {
  const bend = trainLeverBend(m);
  const height = trainLeverHeight(m);
  const spread = trainLeverSpread(m, base);
  const raise = trainArmRaise(m);
  const stance = trainEngineStance(m);
  const level = wristHeightMatch(m);
  const upright = uprightScore(m, base);
  return clamp01(bend * 0.28 + height * 0.26 + spread * 0.18 + raise * 0.12 + stance * 0.1 + level * 0.04 + upright * 0.02);
}

/**
 * Steam chug power — lever pose + forward pump engagement.
 * Uses absolute normalized landmark coordinates vs calibrated baseline.
 */
export function trainChugScore(m: PostureMetrics, base: ForceBaseline): number {
  const form = trainPoseForm(m, base);
  const forward = forwardPressScore(m, base);
  const squeeze = squeezeScore(m, base);
  const symmetry = bilateralPushSymmetry(m);
  const engagement = clamp01(forward * 0.42 + squeeze * 0.35 + symmetry * 0.23);
  return clamp01(form * 0.46 + engagement * 0.54);
}

/** Mirrored engineer lever hand anchors. */
export function mirroredTrainLevers(m: PostureMetrics): {
  left: { x: number; y: number } | null;
  right: { x: number; y: number } | null;
} {
  return mirroredCarryHands(m);
}

/** Nearly straight arms for bulldozer blade push (~12% elbow flexion ideal). */
export function bulldozerBladeExtension(m: PostureMetrics): number {
  const joints = readRobotJoints(m);
  if (!joints.left || !joints.right) return 0;
  const avg = (joints.left.elbow + joints.right.elbow) / 2;
  const ideal = 0.12;
  return clamp01(1 - Math.abs(avg - ideal) / 0.26);
}

/** Palms on blade at waist / lower-torso height. */
export function bulldozerBladeHeight(m: PostureMetrics): number {
  if (!m.leftWrist || !m.rightWrist) return 0;
  const sm = m.shoulderMid;
  const hm = m.hipMid;
  const bladeY = sm.y + (hm.y - sm.y) * 0.58;
  const sw = Math.max(0.12, m.shoulderWidth);
  let sum = 0;
  let n = 0;
  for (const w of [m.leftWrist, m.rightWrist]) {
    sum += clamp01(1 - Math.abs(w.y - bladeY) / (sw * 0.46));
    n++;
  }
  return n ? sum / n : 0;
}

/** Wide grip spread on bulldozer blade controls. */
export function bulldozerBladeSpread(m: PostureMetrics, base: ForceBaseline): number {
  const spread = wristSpreadNorm(m);
  const ideal = base.wristSpreadNorm * 0.88;
  return clamp01(1 - Math.abs(spread - ideal) / Math.max(0.17, base.wristSpreadNorm * 0.38));
}

/** Wide low bulldozer stance — deep knee bend and stable legs. */
export function bulldozerWideStance(m: PostureMetrics): number {
  const legs = readLegJointReadout(m);
  if (!legs.left || !legs.right) return 0;
  const kneeAvg = (legs.left.knee + legs.right.knee) / 2;
  const liftAvg = (legs.left.lift + legs.right.lift) / 2;
  const kneeScore = clamp01(1 - Math.abs(kneeAvg - 0.48) / 0.26);
  const stableLift = clamp01(1 - Math.abs(liftAvg - 0.16) / 0.2);
  return clamp01(kneeScore * 0.64 + stableLift * 0.36);
}

/** Slight forward lean into the blade push vs calibrated baseline. */
export function bulldozerForwardLean(m: PostureMetrics, base: ForceBaseline): number {
  const delta = m.trunkLeanDeg - base.trunkLeanDeg;
  const ideal = 9;
  return clamp01(1 - Math.abs(delta - ideal) / 14);
}

/** Bulldozer blade pose — low extended push + wide stance + forward lean. */
export function bulldozerPoseForm(m: PostureMetrics, base: ForceBaseline): number {
  const extension = bulldozerBladeExtension(m);
  const height = bulldozerBladeHeight(m);
  const spread = bulldozerBladeSpread(m, base);
  const stance = bulldozerWideStance(m);
  const lean = bulldozerForwardLean(m, base);
  const level = wristHeightMatch(m);
  const upright = uprightScore(m, base);
  return clamp01(
    extension * 0.28 + height * 0.26 + spread * 0.14 + stance * 0.18 + lean * 0.08 + level * 0.04 + upright * 0.02,
  );
}

/**
 * Bulldozer blade push — low bilateral thrust while holding blade pose.
 * Uses absolute normalized landmark coordinates vs calibrated baseline.
 */
export function bulldozerPushScore(m: PostureMetrics, base: ForceBaseline): number {
  const form = bulldozerPoseForm(m, base);
  const thrust = rocketPushForceScore(m, base);
  const forward = forwardPressScore(m, base);
  const symmetry = bilateralPushSymmetry(m);
  const stance = bulldozerWideStance(m);
  const engagement = clamp01(thrust * 0.44 + forward * 0.28 + symmetry * 0.18 + stance * 0.1);
  return clamp01(form * 0.44 + engagement * 0.56);
}

/** Mirrored bulldozer blade palm anchors. */
export function mirroredBulldozerPalms(m: PostureMetrics): {
  left: { x: number; y: number } | null;
  right: { x: number; y: number } | null;
} {
  return mirroredCarryHands(m);
}
