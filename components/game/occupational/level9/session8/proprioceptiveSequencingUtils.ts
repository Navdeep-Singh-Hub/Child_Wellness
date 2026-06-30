/**
 * OT Level 9 · Session 8 — Proprioceptive Sequencing pose math.
 * Two-step push-then-carry sequence scoring built on heavy-work primitives.
 */
import { uprightScore, type PostureMetrics } from '@/components/game/occupational/level6/session1/poseUtils';
import type { ForceBaseline } from '@/components/game/occupational/level9/session1/forceUtils';
import {
  carryEffortScore,
  carryPoseForm,
  carryZoneStatus,
  gorillaPoseForm,
  gorillaPowerScore,
  mirroredGorillaHands,
  wallPushForceScore,
  wallPushPoseForm,
  type CarryZoneStatus,
} from '@/components/game/occupational/level9/session4/heavyWorkUtils';
import {
  launchPoseForm,
  launchPowerScore,
  mirroredLaunchPalms,
  shipPullPoseForm,
  shipPullScore,
  mirroredShipRopes,
  strengthPoseForm,
  overheadHoldScore,
  mirroredStrengthPalms,
} from '@/components/game/occupational/level9/session5/resistanceUtils';
import {
  matchFullBodyPose,
  type FullBodyPoseTarget,
  type FullBodyReadout,
} from '@/components/game/occupational/level9/session3/jointUtils';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export type SequenceZoneStatus = CarryZoneStatus;

export { carryZoneStatus as sequenceZoneStatus };

export type PushThenCarryRound = {
  id: string;
  name: string;
  icon: string;
  pushLabel: string;
  carryLabel: string;
  cargo: string;
};

/** Eight cargo haul sequences — push resistance increases each round. */
export const PUSH_THEN_CARRY_ROUNDS: PushThenCarryRound[] = [
  { id: 'light-crate', name: 'Light Crate', icon: '📦', pushLabel: 'PUSH', carryLabel: 'CARRY', cargo: 'Light Crate' },
  { id: 'barrel-haul', name: 'Barrel Haul', icon: '🛢️', pushLabel: 'PUSH', carryLabel: 'CARRY', cargo: 'Barrel' },
  { id: 'stone-block', name: 'Stone Block', icon: '🪨', pushLabel: 'PUSH', carryLabel: 'CARRY', cargo: 'Stone Block' },
  { id: 'timber-load', name: 'Timber Load', icon: '🪵', pushLabel: 'PUSH', carryLabel: 'CARRY', cargo: 'Timber' },
  { id: 'boulder-push', name: 'Boulder Push', icon: '🧱', pushLabel: 'PUSH', carryLabel: 'CARRY', cargo: 'Boulder' },
  { id: 'chest-chain', name: 'Chest Chain', icon: '💎', pushLabel: 'PUSH', carryLabel: 'CARRY', cargo: 'Treasure Chest' },
  { id: 'anchor-crate', name: 'Anchor Crate', icon: '⚓', pushLabel: 'PUSH', carryLabel: 'CARRY', cargo: 'Anchor Crate' },
  { id: 'golden-haul', name: 'Golden Haul', icon: '🌟', pushLabel: 'PUSH', carryLabel: 'CARRY', cargo: 'Golden Crate' },
];

export type StepScore = {
  form: number;
  effort: number;
  status: SequenceZoneStatus;
  power: number;
};

/** Step 1 — bilateral wall-push form + forward thrust effort. */
export function pushStepScore(
  m: PostureMetrics,
  base: ForceBaseline,
  target: number,
  bandHalf: number,
): StepScore {
  const form = wallPushPoseForm(m, base);
  const effort = wallPushForceScore(m, base);
  const status = carryZoneStatus(effort, target, bandHalf);
  const power = clamp01(form * 0.44 + effort * 0.56);
  return { form, effort, status, power };
}

/** Step 2 — carry pose form + sustained haul effort. */
export function carryStepScore(
  m: PostureMetrics,
  base: ForceBaseline,
  target: number,
  bandHalf: number,
): StepScore {
  const form = carryPoseForm(m, base);
  const effort = carryEffortScore(m, base);
  const status = carryZoneStatus(effort, target, bandHalf);
  const power = clamp01(form * 0.46 + effort * 0.54);
  return { form, effort, status, power };
}

/** Combined sequence power from push + carry step peaks. */
export function sequencePowerScore(pushPower: number, carryPower: number): number {
  return clamp01(pushPower * 0.48 + carryPower * 0.52);
}

export type ReachThenPressRound = {
  id: string;
  name: string;
  icon: string;
  reachLabel: string;
  pressLabel: string;
  target: string;
  reach: FullBodyPoseTarget;
};

/** Eight reach-then-press sequences — reach poses escalate each round. */
export const REACH_THEN_PRESS_ROUNDS: ReachThenPressRound[] = [
  {
    id: 'high-reach',
    name: 'High Reach',
    icon: '🙌',
    reachLabel: 'REACH',
    pressLabel: 'PRESS',
    target: 'High Reach',
    reach: {
      id: 'high-reach',
      name: 'High Reach',
      icon: '🙌',
      leftRaise: 0.82,
      rightRaise: 0.82,
      leftElbow: 0.28,
      rightElbow: 0.28,
      leftLift: 0.1,
      rightLift: 0.1,
      leftKnee: 0.14,
      rightKnee: 0.14,
    },
  },
  {
    id: 'side-reach-l',
    name: 'Side Reach Left',
    icon: '👋',
    reachLabel: 'REACH',
    pressLabel: 'PRESS',
    target: 'Side Reach Left',
    reach: {
      id: 'side-reach-l',
      name: 'Side Reach Left',
      icon: '👋',
      leftRaise: 0.78,
      rightRaise: 0.22,
      leftElbow: 0.42,
      rightElbow: 0.2,
      leftLift: 0.1,
      rightLift: 0.1,
      leftKnee: 0.14,
      rightKnee: 0.14,
    },
  },
  {
    id: 'side-reach-r',
    name: 'Side Reach Right',
    icon: '🤚',
    reachLabel: 'REACH',
    pressLabel: 'PRESS',
    target: 'Side Reach Right',
    reach: {
      id: 'side-reach-r',
      name: 'Side Reach Right',
      icon: '🤚',
      leftRaise: 0.2,
      rightRaise: 0.8,
      leftElbow: 0.18,
      rightElbow: 0.45,
      leftLift: 0.1,
      rightLift: 0.1,
      leftKnee: 0.14,
      rightKnee: 0.14,
    },
  },
  {
    id: 'forward-reach',
    name: 'Forward Reach',
    icon: '🙋',
    reachLabel: 'REACH',
    pressLabel: 'PRESS',
    target: 'Forward Reach',
    reach: {
      id: 'forward-reach',
      name: 'Forward Reach',
      icon: '🙋',
      leftRaise: 0.62,
      rightRaise: 0.62,
      leftElbow: 0.22,
      rightElbow: 0.22,
      leftLift: 0.1,
      rightLift: 0.1,
      leftKnee: 0.14,
      rightKnee: 0.14,
    },
  },
  {
    id: 'star-reach',
    name: 'Star Reach',
    icon: '⭐',
    reachLabel: 'REACH',
    pressLabel: 'PRESS',
    target: 'Star Reach',
    reach: {
      id: 'star-reach',
      name: 'Star Reach',
      icon: '⭐',
      leftRaise: 0.86,
      rightRaise: 0.86,
      leftElbow: 0.18,
      rightElbow: 0.18,
      leftLift: 0.42,
      rightLift: 0.1,
      leftKnee: 0.32,
      rightKnee: 0.12,
    },
  },
  {
    id: 'cross-reach',
    name: 'Cross Reach',
    icon: '🦸',
    reachLabel: 'REACH',
    pressLabel: 'PRESS',
    target: 'Cross Reach',
    reach: {
      id: 'cross-reach',
      name: 'Cross Reach',
      icon: '🦸',
      leftRaise: 0.72,
      rightRaise: 0.34,
      leftElbow: 0.38,
      rightElbow: 0.28,
      leftLift: 0.12,
      rightLift: 0.12,
      leftKnee: 0.16,
      rightKnee: 0.16,
    },
  },
  {
    id: 'low-reach',
    name: 'Low Reach',
    icon: '🔦',
    reachLabel: 'REACH',
    pressLabel: 'PRESS',
    target: 'Low Reach',
    reach: {
      id: 'low-reach',
      name: 'Low Reach',
      icon: '🔦',
      leftRaise: 0.38,
      rightRaise: 0.38,
      leftElbow: 0.52,
      rightElbow: 0.52,
      leftLift: 0.1,
      rightLift: 0.1,
      leftKnee: 0.18,
      rightKnee: 0.18,
    },
  },
  {
    id: 'full-reach',
    name: 'Full Reach',
    icon: '🌟',
    reachLabel: 'REACH',
    pressLabel: 'PRESS',
    target: 'Full Reach',
    reach: {
      id: 'full-reach',
      name: 'Full Reach',
      icon: '🌟',
      leftRaise: 0.9,
      rightRaise: 0.9,
      leftElbow: 0.24,
      rightElbow: 0.24,
      leftLift: 0.14,
      rightLift: 0.14,
      leftKnee: 0.22,
      rightKnee: 0.22,
    },
  },
];

/** Step 1 — full-body reach pose match. */
export function reachStepScore(
  m: PostureMetrics,
  round: ReachThenPressRound,
  tolerance: number,
  reachMin: number,
): StepScore & { readout: FullBodyReadout; armsScore: number; legsScore: number } {
  const match = matchFullBodyPose(m, round.reach, tolerance);
  const form = match.score;
  const inZone = form >= reachMin;
  const status: SequenceZoneStatus = inZone ? 'zone' : 'light';
  const power = form;
  return {
    form,
    effort: form,
    status,
    power,
    readout: match.readout,
    armsScore: match.armsScore,
    legsScore: match.legsScore,
  };
}

/** Step 2 — bilateral press form + forward thrust effort. */
export function pressStepScore(
  m: PostureMetrics,
  base: ForceBaseline,
  target: number,
  bandHalf: number,
): StepScore {
  return pushStepScore(m, base, target, bandHalf);
}

/** Combined reach-press sequence power. */
export function reachPressPowerScore(reachPower: number, pressPower: number): number {
  return clamp01(reachPower * 0.5 + pressPower * 0.5);
}

/** Movement quality for reach step (pose match). */
export function reachStepQuality(
  m: PostureMetrics,
  base: ForceBaseline,
  stepScore: StepScore,
  reachMin: number,
): number {
  const upright = uprightScore(m, base);
  const formOk = stepScore.form >= reachMin ? 1 : stepScore.form / Math.max(0.2, reachMin);
  return clamp01(upright * 0.32 + formOk * 0.48 + stepScore.power * 0.2);
}

/** Movement quality for active step. */
export function sequenceStepQuality(
  m: PostureMetrics,
  base: ForceBaseline,
  stepScore: StepScore,
  formMin: number,
): number {
  const upright = uprightScore(m, base);
  const formOk = stepScore.form >= formMin ? 1 : stepScore.form / Math.max(0.2, formMin);
  const zoneOk = stepScore.status === 'zone' ? 1 : stepScore.status === 'light' ? 0.55 : 0.35;
  return clamp01(upright * 0.28 + formOk * 0.38 + zoneOk * 0.22 + stepScore.power * 0.12);
}

export type PowerSequenceRound = {
  id: string;
  name: string;
  icon: string;
  chargeLabel: string;
  blastLabel: string;
  core: string;
};

/** Eight charge-then-blast power sequences. */
export const POWER_SEQUENCE_ROUNDS: PowerSequenceRound[] = [
  { id: 'spark-charge', name: 'Spark Charge', icon: '🔋', chargeLabel: 'CHARGE', blastLabel: 'BLAST', core: 'Spark Core' },
  { id: 'core-pulse', name: 'Core Pulse', icon: '⚡', chargeLabel: 'CHARGE', blastLabel: 'BLAST', core: 'Pulse Core' },
  { id: 'thunder-build', name: 'Thunder Build', icon: '💥', chargeLabel: 'CHARGE', blastLabel: 'BLAST', core: 'Thunder Core' },
  { id: 'flare-charge', name: 'Flare Charge', icon: '🔥', chargeLabel: 'CHARGE', blastLabel: 'BLAST', core: 'Flare Core' },
  { id: 'star-burst', name: 'Star Burst', icon: '⭐', chargeLabel: 'CHARGE', blastLabel: 'BLAST', core: 'Star Core' },
  { id: 'rocket-blast', name: 'Rocket Blast', icon: '🚀', chargeLabel: 'CHARGE', blastLabel: 'BLAST', core: 'Rocket Core' },
  { id: 'nova-charge', name: 'Nova Charge', icon: '💫', chargeLabel: 'CHARGE', blastLabel: 'BLAST', core: 'Nova Core' },
  { id: 'vault-master', name: 'Vault Master', icon: '🌟', chargeLabel: 'CHARGE', blastLabel: 'BLAST', core: 'Master Core' },
];

/** Step 1 — gorilla power stance charge with controlled effort. */
export function powerChargeStepScore(
  m: PostureMetrics,
  base: ForceBaseline,
  target: number,
  bandHalf: number,
): StepScore {
  const form = gorillaPoseForm(m, base);
  const effort = gorillaPowerScore(m, base);
  const status = carryZoneStatus(effort, target, bandHalf);
  const power = clamp01(form * 0.46 + effort * 0.54);
  return { form, effort, status, power };
}

/** Step 2 — launch ignition blast with controlled upward thrust. */
export function powerBlastStepScore(
  m: PostureMetrics,
  base: ForceBaseline,
  target: number,
  bandHalf: number,
): StepScore {
  const form = launchPoseForm(m, base);
  const effort = launchPowerScore(m, base);
  const status = carryZoneStatus(effort, target, bandHalf);
  const power = clamp01(form * 0.44 + effort * 0.56);
  return { form, effort, status, power };
}

/** Combined power sequence score from charge + blast peaks. */
export function powerSequenceScore(chargePower: number, blastPower: number): number {
  return clamp01(chargePower * 0.48 + blastPower * 0.52);
}

export { mirroredGorillaHands, mirroredLaunchPalms };

export type PirateWorkMissionRound = {
  id: string;
  name: string;
  icon: string;
  haulLabel: string;
  stowLabel: string;
  loot: string;
};

/** Eight pirate work missions — haul then stow treasure. */
export const PIRATE_WORK_MISSION_ROUNDS: PirateWorkMissionRound[] = [
  { id: 'rope-haul', name: 'Rope Haul', icon: '🪢', haulLabel: 'HAUL', stowLabel: 'STOW', loot: 'Rope Chest' },
  { id: 'deck-cargo', name: 'Deck Cargo', icon: '📦', haulLabel: 'HAUL', stowLabel: 'STOW', loot: 'Deck Crate' },
  { id: 'gold-stow', name: 'Gold Stow', icon: '💰', haulLabel: 'HAUL', stowLabel: 'STOW', loot: 'Gold Chest' },
  { id: 'pearl-haul', name: 'Pearl Haul', icon: '💎', haulLabel: 'HAUL', stowLabel: 'STOW', loot: 'Pearl Chest' },
  { id: 'cannon-pull', name: 'Cannon Pull', icon: '💣', haulLabel: 'HAUL', stowLabel: 'STOW', loot: 'Cannon Crate' },
  { id: 'crown-stow', name: 'Crown Stow', icon: '👑', haulLabel: 'HAUL', stowLabel: 'STOW', loot: 'Crown Chest' },
  { id: 'anchor-haul', name: 'Anchor Haul', icon: '⚓', haulLabel: 'HAUL', stowLabel: 'STOW', loot: 'Anchor Chest' },
  { id: 'captain-loot', name: 'Captain Loot', icon: '🌟', haulLabel: 'HAUL', stowLabel: 'STOW', loot: 'Captain Chest' },
];

/** Step 1 — ship tow rope haul with controlled backward pull effort. */
export function pirateHaulStepScore(
  m: PostureMetrics,
  base: ForceBaseline,
  target: number,
  bandHalf: number,
): StepScore {
  const form = shipPullPoseForm(m, base);
  const effort = shipPullScore(m, base);
  const status = carryZoneStatus(effort, target, bandHalf);
  const power = clamp01(form * 0.46 + effort * 0.54);
  return { form, effort, status, power };
}

/** Step 2 — treasure stow carry with controlled haul effort. */
export function pirateStowStepScore(
  m: PostureMetrics,
  base: ForceBaseline,
  target: number,
  bandHalf: number,
): StepScore {
  return carryStepScore(m, base, target, bandHalf);
}

/** Combined pirate work mission score from haul + stow peaks. */
export function pirateMissionScore(haulPower: number, stowPower: number): number {
  return clamp01(haulPower * 0.5 + stowPower * 0.5);
}

export { mirroredShipRopes };

export type RainbowChallengeRound = {
  id: string;
  name: string;
  icon: string;
  archLabel: string;
  glowLabel: string;
  colorName: string;
  color: string;
  arch: FullBodyPoseTarget;
};

/** Eight rainbow challenges — arch pose then overhead glow hold. */
export const RAINBOW_CHALLENGE_ROUNDS: RainbowChallengeRound[] = [
  {
    id: 'red-arch',
    name: 'Red Arch',
    icon: '🔴',
    archLabel: 'ARCH',
    glowLabel: 'GLOW',
    colorName: 'Red',
    color: '#EF4444',
    arch: {
      id: 'red-arch',
      name: 'Red Arch',
      icon: '🔴',
      leftRaise: 0.86,
      rightRaise: 0.86,
      leftElbow: 0.38,
      rightElbow: 0.38,
      leftLift: 0.1,
      rightLift: 0.1,
      leftKnee: 0.14,
      rightKnee: 0.14,
    },
  },
  {
    id: 'orange-curve',
    name: 'Orange Curve',
    icon: '🟠',
    archLabel: 'ARCH',
    glowLabel: 'GLOW',
    colorName: 'Orange',
    color: '#F97316',
    arch: {
      id: 'orange-curve',
      name: 'Orange Curve',
      icon: '🟠',
      leftRaise: 0.84,
      rightRaise: 0.84,
      leftElbow: 0.42,
      rightElbow: 0.42,
      leftLift: 0.1,
      rightLift: 0.1,
      leftKnee: 0.14,
      rightKnee: 0.14,
    },
  },
  {
    id: 'yellow-arc',
    name: 'Yellow Arc',
    icon: '🟡',
    archLabel: 'ARCH',
    glowLabel: 'GLOW',
    colorName: 'Yellow',
    color: '#EAB308',
    arch: {
      id: 'yellow-arc',
      name: 'Yellow Arc',
      icon: '🟡',
      leftRaise: 0.88,
      rightRaise: 0.82,
      leftElbow: 0.36,
      rightElbow: 0.4,
      leftLift: 0.1,
      rightLift: 0.1,
      leftKnee: 0.14,
      rightKnee: 0.14,
    },
  },
  {
    id: 'green-bridge',
    name: 'Green Bridge',
    icon: '🟢',
    archLabel: 'ARCH',
    glowLabel: 'GLOW',
    colorName: 'Green',
    color: '#22C55E',
    arch: {
      id: 'green-bridge',
      name: 'Green Bridge',
      icon: '🟢',
      leftRaise: 0.82,
      rightRaise: 0.88,
      leftElbow: 0.4,
      rightElbow: 0.36,
      leftLift: 0.1,
      rightLift: 0.1,
      leftKnee: 0.14,
      rightKnee: 0.14,
    },
  },
  {
    id: 'blue-bow',
    name: 'Blue Bow',
    icon: '🔵',
    archLabel: 'ARCH',
    glowLabel: 'GLOW',
    colorName: 'Blue',
    color: '#3B82F6',
    arch: {
      id: 'blue-bow',
      name: 'Blue Bow',
      icon: '🔵',
      leftRaise: 0.9,
      rightRaise: 0.9,
      leftElbow: 0.34,
      rightElbow: 0.34,
      leftLift: 0.12,
      rightLift: 0.12,
      leftKnee: 0.16,
      rightKnee: 0.16,
    },
  },
  {
    id: 'indigo-span',
    name: 'Indigo Span',
    icon: '🟣',
    archLabel: 'ARCH',
    glowLabel: 'GLOW',
    colorName: 'Indigo',
    color: '#6366F1',
    arch: {
      id: 'indigo-span',
      name: 'Indigo Span',
      icon: '🟣',
      leftRaise: 0.87,
      rightRaise: 0.87,
      leftElbow: 0.44,
      rightElbow: 0.44,
      leftLift: 0.1,
      rightLift: 0.1,
      leftKnee: 0.14,
      rightKnee: 0.14,
    },
  },
  {
    id: 'violet-veil',
    name: 'Violet Veil',
    icon: '💜',
    archLabel: 'ARCH',
    glowLabel: 'GLOW',
    colorName: 'Violet',
    color: '#A855F7',
    arch: {
      id: 'violet-veil',
      name: 'Violet Veil',
      icon: '💜',
      leftRaise: 0.9,
      rightRaise: 0.86,
      leftElbow: 0.38,
      rightElbow: 0.42,
      leftLift: 0.36,
      rightLift: 0.1,
      leftKnee: 0.28,
      rightKnee: 0.12,
    },
  },
  {
    id: 'gold-shine',
    name: 'Gold Shine',
    icon: '✨',
    archLabel: 'ARCH',
    glowLabel: 'GLOW',
    colorName: 'Gold',
    color: '#FBBF24',
    arch: {
      id: 'gold-shine',
      name: 'Gold Shine',
      icon: '✨',
      leftRaise: 0.92,
      rightRaise: 0.92,
      leftElbow: 0.32,
      rightElbow: 0.32,
      leftLift: 0.14,
      rightLift: 0.14,
      leftKnee: 0.2,
      rightKnee: 0.2,
    },
  },
];

/** Step 1 — rainbow arch full-body pose match. */
export function rainbowArchStepScore(
  m: PostureMetrics,
  round: RainbowChallengeRound,
  tolerance: number,
  archMin: number,
): StepScore & { readout: FullBodyReadout; armsScore: number; legsScore: number } {
  const match = matchFullBodyPose(m, round.arch, tolerance);
  const form = match.score;
  const inZone = form >= archMin;
  const status: SequenceZoneStatus = inZone ? 'zone' : 'light';
  const power = form;
  return {
    form,
    effort: form,
    status,
    power,
    readout: match.readout,
    armsScore: match.armsScore,
    legsScore: match.legsScore,
  };
}

/** Step 2 — overhead rainbow glow hold with controlled isometric effort. */
export function rainbowGlowStepScore(
  m: PostureMetrics,
  base: ForceBaseline,
  target: number,
  bandHalf: number,
): StepScore {
  const form = strengthPoseForm(m, base);
  const effort = overheadHoldScore(m, base);
  const status = carryZoneStatus(effort, target, bandHalf);
  const power = clamp01(form * 0.48 + effort * 0.52);
  return { form, effort, status, power };
}

/** Movement quality for rainbow arch step (pose match). */
export function rainbowArchStepQuality(
  m: PostureMetrics,
  base: ForceBaseline,
  stepScore: StepScore,
  archMin: number,
): number {
  const upright = uprightScore(m, base);
  const formOk = stepScore.form >= archMin ? 1 : stepScore.form / Math.max(0.2, archMin);
  return clamp01(upright * 0.32 + formOk * 0.48 + stepScore.power * 0.2);
}

/** Combined rainbow challenge score from arch + glow peaks. */
export function rainbowChallengeScore(archPower: number, glowPower: number): number {
  return clamp01(archPower * 0.5 + glowPower * 0.5);
}

export { mirroredStrengthPalms };
