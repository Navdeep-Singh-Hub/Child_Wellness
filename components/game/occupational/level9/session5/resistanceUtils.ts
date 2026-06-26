/**
 * OT Level 9 · Session 5 — Resistance Control pose math.
 * Estimates launch-pad squat pose and sustained upward ignition effort.
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
  type ForceBaseline,
  wristHeightMatch,
  wristSpreadNorm,
  squeezeScore,
} from '@/components/game/occupational/level9/session1/forceUtils';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export type ResistanceZoneStatus = 'light' | 'zone' | 'heavy';

export function resistanceZoneStatus(power: number, target: number, bandHalf: number): ResistanceZoneStatus {
  if (power < target - bandHalf) return 'light';
  if (power > target + bandHalf) return 'heavy';
  return 'zone';
}

/** Deep squat launch-pad stance (~55% knee bend ideal). */
export function launchPadSquat(m: PostureMetrics): number {
  const legs = readLegJointReadout(m);
  if (!legs.left || !legs.right) return 0;
  const kneeAvg = (legs.left.knee + legs.right.knee) / 2;
  const liftAvg = (legs.left.lift + legs.right.lift) / 2;
  const kneeScore = clamp01(1 - Math.abs(kneeAvg - 0.55) / 0.26);
  const stableLift = clamp01(1 - Math.abs(liftAvg - 0.18) / 0.2);
  return clamp01(kneeScore * 0.66 + stableLift * 0.34);
}

/** Shoulder raise for upward ignition thrust (~68% ideal). */
export function launchIgnitionRaise(m: PostureMetrics): number {
  const joints = readRobotJoints(m);
  if (!joints.left || !joints.right) return 0;
  const avg = (joints.left.raise + joints.right.raise) / 2;
  const ideal = 0.68;
  return clamp01(1 - Math.abs(avg - ideal) / 0.28);
}

/** Elbow bend for ignition push (~35% flexion ideal). */
export function launchIgnitionBend(m: PostureMetrics): number {
  const joints = readRobotJoints(m);
  if (!joints.left || !joints.right) return 0;
  const avg = (joints.left.elbow + joints.right.elbow) / 2;
  const ideal = 0.35;
  return clamp01(1 - Math.abs(avg - ideal) / 0.28);
}

/** Wrists at upper-chest ignition thrust height. */
export function launchThrustHeight(m: PostureMetrics): number {
  if (!m.leftWrist || !m.rightWrist) return 0;
  const sm = m.shoulderMid;
  const hm = m.hipMid;
  const thrustY = sm.y + (hm.y - sm.y) * 0.28;
  const sw = Math.max(0.12, m.shoulderWidth);
  let sum = 0;
  let n = 0;
  for (const w of [m.leftWrist, m.rightWrist]) {
    sum += clamp01(1 - Math.abs(w.y - thrustY) / (sw * 0.44));
    n++;
  }
  return n ? sum / n : 0;
}

/** Moderate grip spread on ignition controls. */
export function launchIgnitionSpread(m: PostureMetrics, base: ForceBaseline): number {
  const spread = wristSpreadNorm(m);
  const ideal = base.wristSpreadNorm * 0.82;
  return clamp01(1 - Math.abs(spread - ideal) / Math.max(0.16, base.wristSpreadNorm * 0.36));
}

/** Upward push against resistance spring — wrists raised above shoulder line. */
export function upwardResistanceScore(m: PostureMetrics, base: ForceBaseline): number {
  if (!m.leftWrist || !m.rightWrist) return 0;
  const sm = m.shoulderMid;
  const sw = Math.max(0.12, m.shoulderWidth);
  let sum = 0;
  let n = 0;
  for (const w of [m.leftWrist, m.rightWrist]) {
    const raised = clamp01((sm.y - w.y) / (sw * 0.55));
    sum += raised;
    n++;
  }
  const raw = n ? sum / n : 0;
  const headroom = Math.max(0.22, 1 - base.wristForwardNorm);
  return clamp01((raw - base.wristForwardNorm * 0.72) / headroom);
}

/** Squat launch-pad + upward ignition pose form. */
export function launchPoseForm(m: PostureMetrics, base: ForceBaseline): number {
  const squat = launchPadSquat(m);
  const raise = launchIgnitionRaise(m);
  const bend = launchIgnitionBend(m);
  const height = launchThrustHeight(m);
  const spread = launchIgnitionSpread(m, base);
  const level = wristHeightMatch(m);
  const upright = uprightScore(m, base);
  return clamp01(squat * 0.24 + raise * 0.22 + bend * 0.18 + height * 0.2 + spread * 0.08 + level * 0.04 + upright * 0.04);
}

/**
 * Launch ignition power — squat pose + upward resistance engagement.
 * Uses absolute normalized landmark coordinates vs calibrated baseline.
 */
export function launchPowerScore(m: PostureMetrics, base: ForceBaseline): number {
  const form = launchPoseForm(m, base);
  const upward = upwardResistanceScore(m, base);
  const forward = forwardPressScore(m, base);
  const squeeze = squeezeScore(m, base);
  const symmetry = bilateralPushSymmetry(m);
  const squat = launchPadSquat(m);
  const engagement = clamp01(upward * 0.38 + forward * 0.28 + squeeze * 0.2 + symmetry * 0.14);
  return clamp01(form * 0.46 + engagement * 0.44 + squat * 0.1);
}

/** Mirrored ignition palm anchors. */
export function mirroredLaunchPalms(m: PostureMetrics): {
  left: { x: number; y: number } | null;
  right: { x: number; y: number } | null;
} {
  return {
    left: m.leftWrist ? { x: 1 - m.leftWrist.x, y: m.leftWrist.y } : null,
    right: m.rightWrist ? { x: 1 - m.rightWrist.x, y: m.rightWrist.y } : null,
  };
}

/** Wide anchor stance for ship tow (~42% knee bend ideal). */
export function shipAnchorStance(m: PostureMetrics): number {
  const legs = readLegJointReadout(m);
  if (!legs.left || !legs.right) return 0;
  const kneeAvg = (legs.left.knee + legs.right.knee) / 2;
  const liftAvg = (legs.left.lift + legs.right.lift) / 2;
  const kneeScore = clamp01(1 - Math.abs(kneeAvg - 0.42) / 0.26);
  const stableLift = clamp01(1 - Math.abs(liftAvg - 0.14) / 0.2);
  return clamp01(kneeScore * 0.64 + stableLift * 0.36);
}

/** Tow rope elbow bend (~58% flexion ideal). */
export function shipTowBend(m: PostureMetrics): number {
  const joints = readRobotJoints(m);
  if (!joints.left || !joints.right) return 0;
  const avg = (joints.left.elbow + joints.right.elbow) / 2;
  const ideal = 0.58;
  return clamp01(1 - Math.abs(avg - ideal) / 0.3);
}

/** Wrists at waist tow-rope pull height. */
export function shipRopeHeight(m: PostureMetrics): number {
  if (!m.leftWrist || !m.rightWrist) return 0;
  const sm = m.shoulderMid;
  const hm = m.hipMid;
  const ropeY = sm.y + (hm.y - sm.y) * 0.54;
  const sw = Math.max(0.12, m.shoulderWidth);
  let sum = 0;
  let n = 0;
  for (const w of [m.leftWrist, m.rightWrist]) {
    sum += clamp01(1 - Math.abs(w.y - ropeY) / (sw * 0.46));
    n++;
  }
  return n ? sum / n : 0;
}

/** Moderate rope grip spread on tow handles. */
export function shipRopeSpread(m: PostureMetrics, base: ForceBaseline): number {
  const spread = wristSpreadNorm(m);
  const ideal = base.wristSpreadNorm * 0.74;
  return clamp01(1 - Math.abs(spread - ideal) / Math.max(0.16, base.wristSpreadNorm * 0.36));
}

/** Backward lean into tow pull vs calibrated baseline. */
export function shipPullLean(m: PostureMetrics, base: ForceBaseline): number {
  const delta = base.trunkLeanDeg - m.trunkLeanDeg;
  const ideal = 9;
  return clamp01(1 - Math.abs(delta - ideal) / 14);
}

/** Ship tow rope pose — anchor stance + waist pull + backward lean. */
export function shipPullPoseForm(m: PostureMetrics, base: ForceBaseline): number {
  const anchor = shipAnchorStance(m);
  const bend = shipTowBend(m);
  const height = shipRopeHeight(m);
  const spread = shipRopeSpread(m, base);
  const lean = shipPullLean(m, base);
  const level = wristHeightMatch(m);
  const upright = uprightScore(m, base);
  return clamp01(anchor * 0.22 + bend * 0.24 + height * 0.24 + spread * 0.14 + lean * 0.1 + level * 0.04 + upright * 0.02);
}

/** Backward tow pull engagement — squeeze + lean back + low wrist pull. */
export function backwardPullScore(m: PostureMetrics, base: ForceBaseline): number {
  if (!m.leftWrist || !m.rightWrist) return 0;
  const sm = m.shoulderMid;
  const sw = Math.max(0.12, m.shoulderWidth);
  let lowSum = 0;
  let n = 0;
  for (const w of [m.leftWrist, m.rightWrist]) {
    lowSum += clamp01((w.y - sm.y) / (sw * 0.62));
    n++;
  }
  const lowPull = n ? lowSum / n : 0;
  const squeeze = squeezeScore(m, base);
  const symmetry = bilateralSqueezeSymmetry(m);
  const lean = shipPullLean(m, base);
  return clamp01(squeeze * 0.4 + symmetry * 0.28 + lean * 0.2 + lowPull * 0.12);
}

/**
 * Ship tow pull power — anchor pose + backward rope resistance engagement.
 * Uses absolute normalized landmark coordinates vs calibrated baseline.
 */
export function shipPullScore(m: PostureMetrics, base: ForceBaseline): number {
  const form = shipPullPoseForm(m, base);
  const pull = backwardPullScore(m, base);
  const anchor = shipAnchorStance(m);
  const squeeze = squeezeScore(m, base);
  const symmetry = bilateralSqueezeSymmetry(m);
  const engagement = clamp01(pull * 0.52 + squeeze * 0.28 + symmetry * 0.12 + anchor * 0.08);
  return clamp01(form * 0.48 + engagement * 0.52);
}

/** Mirrored tow-rope hand anchors. */
export function mirroredShipRopes(m: PostureMetrics): {
  left: { x: number; y: number } | null;
  right: { x: number; y: number } | null;
} {
  return mirroredLaunchPalms(m);
}

/** Tug battle anchor stance (~45% knee bend ideal). */
export function tugBattleStance(m: PostureMetrics): number {
  const legs = readLegJointReadout(m);
  if (!legs.left || !legs.right) return 0;
  const kneeAvg = (legs.left.knee + legs.right.knee) / 2;
  const liftAvg = (legs.left.lift + legs.right.lift) / 2;
  const kneeScore = clamp01(1 - Math.abs(kneeAvg - 0.45) / 0.26);
  const stableLift = clamp01(1 - Math.abs(liftAvg - 0.15) / 0.2);
  return clamp01(kneeScore * 0.64 + stableLift * 0.36);
}

/** Semi-extended arms for lateral tug (~24% elbow flexion ideal). */
export function tugArmExtension(m: PostureMetrics): number {
  const joints = readRobotJoints(m);
  if (!joints.left || !joints.right) return 0;
  const avg = (joints.left.elbow + joints.right.elbow) / 2;
  const ideal = 0.24;
  return clamp01(1 - Math.abs(avg - ideal) / 0.28);
}

/** Wrists at chest-height tug rope handles. */
export function tugRopeChestHeight(m: PostureMetrics): number {
  if (!m.leftWrist || !m.rightWrist) return 0;
  const sm = m.shoulderMid;
  const hm = m.hipMid;
  const ropeY = sm.y + (hm.y - sm.y) * 0.36;
  const sw = Math.max(0.12, m.shoulderWidth);
  let sum = 0;
  let n = 0;
  for (const w of [m.leftWrist, m.rightWrist]) {
    sum += clamp01(1 - Math.abs(w.y - ropeY) / (sw * 0.48));
    n++;
  }
  return n ? sum / n : 0;
}

/** Wide outward rope spread for lateral tug (~108% baseline ideal). */
export function tugOutwardSpread(m: PostureMetrics, base: ForceBaseline): number {
  const spread = wristSpreadNorm(m);
  const ideal = base.wristSpreadNorm * 1.08;
  return clamp01(1 - Math.abs(spread - ideal) / Math.max(0.18, base.wristSpreadNorm * 0.4));
}

/** Even bilateral outward tug symmetry. */
export function tugOutwardSymmetry(m: PostureMetrics): number {
  if (!m.leftWrist || !m.rightWrist) return 0;
  const sm = m.shoulderMid.x;
  const sw = Math.max(0.12, m.shoulderWidth);
  const lDist = Math.abs(m.leftWrist.x - sm);
  const rDist = Math.abs(m.rightWrist.x - sm);
  return clamp01(1 - Math.abs(lDist - rDist) / (sw * 0.28));
}

/** Outward lateral tug engagement — wrists spread wider than baseline. */
export function outwardTugScore(m: PostureMetrics, base: ForceBaseline): number {
  const spread = wristSpreadNorm(m);
  const delta = spread - base.wristSpreadNorm;
  const range = Math.max(0.22, base.wristSpreadNorm * 0.48);
  const outward = clamp01(delta / range);
  const symmetry = tugOutwardSymmetry(m);
  const forward = forwardPressScore(m, base);
  const level = wristHeightMatch(m);
  return clamp01(outward * 0.52 + symmetry * 0.3 + forward * 0.12 + level * 0.06);
}

/** Tug battle pose — wide stance + chest-height outward rope pull. */
export function tugPoseForm(m: PostureMetrics, base: ForceBaseline): number {
  const stance = tugBattleStance(m);
  const extension = tugArmExtension(m);
  const height = tugRopeChestHeight(m);
  const spread = tugOutwardSpread(m, base);
  const symmetry = tugOutwardSymmetry(m);
  const level = wristHeightMatch(m);
  const upright = uprightScore(m, base);
  return clamp01(stance * 0.22 + extension * 0.24 + height * 0.24 + spread * 0.16 + symmetry * 0.08 + level * 0.04 + upright * 0.02);
}

/**
 * Lateral tug power — battle stance + outward rope resistance engagement.
 * Uses absolute normalized landmark coordinates vs calibrated baseline.
 */
export function tugChallengeScore(m: PostureMetrics, base: ForceBaseline): number {
  const form = tugPoseForm(m, base);
  const outward = outwardTugScore(m, base);
  const stance = tugBattleStance(m);
  const symmetry = tugOutwardSymmetry(m);
  const engagement = clamp01(outward * 0.58 + symmetry * 0.28 + stance * 0.14);
  return clamp01(form * 0.48 + engagement * 0.52);
}

/** Mirrored tug-rope handle anchors. */
export function mirroredTugHandles(m: PostureMetrics): {
  left: { x: number; y: number } | null;
  right: { x: number; y: number } | null;
} {
  return mirroredLaunchPalms(m);
}

/** Crater brace stance (~40% knee bend ideal). */
export function volcanoCraterStance(m: PostureMetrics): number {
  const legs = readLegJointReadout(m);
  if (!legs.left || !legs.right) return 0;
  const kneeAvg = (legs.left.knee + legs.right.knee) / 2;
  const liftAvg = (legs.left.lift + legs.right.lift) / 2;
  const kneeScore = clamp01(1 - Math.abs(kneeAvg - 0.4) / 0.26);
  const stableLift = clamp01(1 - Math.abs(liftAvg - 0.14) / 0.2);
  return clamp01(kneeScore * 0.64 + stableLift * 0.36);
}

/** Elbow bend for downward vent push (~46% flexion ideal). */
export function volcanoPressBend(m: PostureMetrics): number {
  const joints = readRobotJoints(m);
  if (!joints.left || !joints.right) return 0;
  const avg = (joints.left.elbow + joints.right.elbow) / 2;
  const ideal = 0.46;
  return clamp01(1 - Math.abs(avg - ideal) / 0.28);
}

/** Palms pressing downward on mid-torso lava vent. */
export function volcanoVentHeight(m: PostureMetrics): number {
  if (!m.leftWrist || !m.rightWrist) return 0;
  const sm = m.shoulderMid;
  const hm = m.hipMid;
  const ventY = sm.y + (hm.y - sm.y) * 0.5;
  const sw = Math.max(0.12, m.shoulderWidth);
  let sum = 0;
  let n = 0;
  for (const w of [m.leftWrist, m.rightWrist]) {
    sum += clamp01(1 - Math.abs(w.y - ventY) / (sw * 0.46));
    n++;
  }
  return n ? sum / n : 0;
}

/** Moderate palm spread on vent cap. */
export function volcanoPalmSpread(m: PostureMetrics, base: ForceBaseline): number {
  const spread = wristSpreadNorm(m);
  const ideal = base.wristSpreadNorm * 0.7;
  return clamp01(1 - Math.abs(spread - ideal) / Math.max(0.15, base.wristSpreadNorm * 0.34));
}

/** Forward lean bracing into vent push vs calibrated baseline. */
export function volcanoBraceLean(m: PostureMetrics, base: ForceBaseline): number {
  const delta = m.trunkLeanDeg - base.trunkLeanDeg;
  const ideal = 11;
  return clamp01(1 - Math.abs(delta - ideal) / 14);
}

/** Downward eruption resistance — palms pressed below shoulder line. */
export function downwardVolcanoScore(m: PostureMetrics, base: ForceBaseline): number {
  if (!m.leftWrist || !m.rightWrist) return 0;
  const sm = m.shoulderMid;
  const sw = Math.max(0.12, m.shoulderWidth);
  let downSum = 0;
  let n = 0;
  for (const w of [m.leftWrist, m.rightWrist]) {
    downSum += clamp01((w.y - sm.y) / (sw * 0.58));
    n++;
  }
  const downPress = n ? downSum / n : 0;
  const forward = forwardPressScore(m, base);
  const squeeze = squeezeScore(m, base);
  const symmetry = bilateralPushSymmetry(m);
  const lean = volcanoBraceLean(m, base);
  return clamp01(downPress * 0.38 + forward * 0.28 + squeeze * 0.18 + symmetry * 0.1 + lean * 0.06);
}

/** Volcano vent push pose — crater stance + downward palm press + forward brace. */
export function volcanoPoseForm(m: PostureMetrics, base: ForceBaseline): number {
  const stance = volcanoCraterStance(m);
  const bend = volcanoPressBend(m);
  const height = volcanoVentHeight(m);
  const spread = volcanoPalmSpread(m, base);
  const lean = volcanoBraceLean(m, base);
  const level = wristHeightMatch(m);
  const upright = uprightScore(m, base);
  return clamp01(stance * 0.22 + bend * 0.24 + height * 0.24 + spread * 0.14 + lean * 0.1 + level * 0.04 + upright * 0.02);
}

/**
 * Volcano push power — crater pose + downward vent resistance engagement.
 * Uses absolute normalized landmark coordinates vs calibrated baseline.
 */
export function volcanoPushScore(m: PostureMetrics, base: ForceBaseline): number {
  const form = volcanoPoseForm(m, base);
  const down = downwardVolcanoScore(m, base);
  const stance = volcanoCraterStance(m);
  const forward = forwardPressScore(m, base);
  const engagement = clamp01(down * 0.56 + forward * 0.28 + stance * 0.16);
  return clamp01(form * 0.48 + engagement * 0.52);
}

/** Mirrored lava vent palm anchors. */
export function mirroredVolcanoPalms(m: PostureMetrics): {
  left: { x: number; y: number } | null;
  right: { x: number; y: number } | null;
} {
  return mirroredLaunchPalms(m);
}

/** Colosseum power stance (~38% knee bend ideal). */
export function strengthColosseumStance(m: PostureMetrics): number {
  const legs = readLegJointReadout(m);
  if (!legs.left || !legs.right) return 0;
  const kneeAvg = (legs.left.knee + legs.right.knee) / 2;
  const liftAvg = (legs.left.lift + legs.right.lift) / 2;
  const kneeScore = clamp01(1 - Math.abs(kneeAvg - 0.38) / 0.26);
  const stableLift = clamp01(1 - Math.abs(liftAvg - 0.13) / 0.2);
  return clamp01(kneeScore * 0.64 + stableLift * 0.36);
}

/** Nearly straight arms overhead (~12% elbow flexion ideal). */
export function strengthArmExtension(m: PostureMetrics): number {
  const joints = readRobotJoints(m);
  if (!joints.left || !joints.right) return 0;
  const avg = (joints.left.elbow + joints.right.elbow) / 2;
  const ideal = 0.12;
  return clamp01(1 - Math.abs(avg - ideal) / 0.26);
}

/** Wrists at overhead pillar height above shoulders. */
export function strengthOverheadHeight(m: PostureMetrics): number {
  if (!m.leftWrist || !m.rightWrist) return 0;
  const sm = m.shoulderMid;
  const sw = Math.max(0.12, m.shoulderWidth);
  const pillarY = sm.y - sw * 0.34;
  let sum = 0;
  let n = 0;
  for (const w of [m.leftWrist, m.rightWrist]) {
    sum += clamp01(1 - Math.abs(w.y - pillarY) / (sw * 0.42));
    n++;
  }
  return n ? sum / n : 0;
}

/** Moderate grip spread on overhead pillar handles. */
export function strengthGripSpread(m: PostureMetrics, base: ForceBaseline): number {
  const spread = wristSpreadNorm(m);
  const ideal = base.wristSpreadNorm * 0.65;
  return clamp01(1 - Math.abs(spread - ideal) / Math.max(0.15, base.wristSpreadNorm * 0.34));
}

/** Upright core lock for isometric overhead hold. */
export function strengthUprightLock(m: PostureMetrics, base: ForceBaseline): number {
  const upright = uprightScore(m, base);
  const delta = Math.abs(m.trunkLeanDeg - base.trunkLeanDeg);
  const neutral = clamp01(1 - delta / 12);
  return clamp01(upright * 0.62 + neutral * 0.38);
}

/** Overhead isometric hold — wrists raised well above shoulder line. */
export function overheadHoldScore(m: PostureMetrics, base: ForceBaseline): number {
  if (!m.leftWrist || !m.rightWrist) return 0;
  const sm = m.shoulderMid;
  const sw = Math.max(0.12, m.shoulderWidth);
  let sum = 0;
  let n = 0;
  for (const w of [m.leftWrist, m.rightWrist]) {
    const raised = clamp01((sm.y - w.y) / (sw * 0.82));
    sum += raised;
    n++;
  }
  const raw = n ? sum / n : 0;
  const headroom = Math.max(0.24, 1 - base.wristForwardNorm);
  const squeeze = squeezeScore(m, base);
  const symmetry = bilateralPushSymmetry(m);
  const lock = strengthUprightLock(m, base);
  const engagement = clamp01(((raw - base.wristForwardNorm * 0.55) / headroom) * 0.52 + squeeze * 0.22 + symmetry * 0.16 + lock * 0.1);
  return engagement;
}

/** Colosseum pose — power stance + straight overhead pillar hold. */
export function strengthPoseForm(m: PostureMetrics, base: ForceBaseline): number {
  const stance = strengthColosseumStance(m);
  const extension = strengthArmExtension(m);
  const height = strengthOverheadHeight(m);
  const spread = strengthGripSpread(m, base);
  const lock = strengthUprightLock(m, base);
  const level = wristHeightMatch(m);
  const upright = uprightScore(m, base);
  return clamp01(stance * 0.22 + extension * 0.24 + height * 0.26 + spread * 0.12 + lock * 0.1 + level * 0.04 + upright * 0.02);
}

/**
 * Strength master power — colosseum pose + overhead pillar resistance engagement.
 * Uses absolute normalized landmark coordinates vs calibrated baseline.
 */
export function strengthMasterScore(m: PostureMetrics, base: ForceBaseline): number {
  const form = strengthPoseForm(m, base);
  const overhead = overheadHoldScore(m, base);
  const stance = strengthColosseumStance(m);
  const lock = strengthUprightLock(m, base);
  const engagement = clamp01(overhead * 0.58 + lock * 0.24 + stance * 0.18);
  return clamp01(form * 0.48 + engagement * 0.52);
}

/** Mirrored overhead pillar hand anchors. */
export function mirroredStrengthPalms(m: PostureMetrics): {
  left: { x: number; y: number } | null;
  right: { x: number; y: number } | null;
} {
  return mirroredLaunchPalms(m);
}
