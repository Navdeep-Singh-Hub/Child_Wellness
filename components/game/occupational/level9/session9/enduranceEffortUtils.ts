/**
 * OT Level 9 · Session 9 — Endurance & Effort Regulation pose math.
 */
import { uprightScore, type PostureMetrics } from '@/components/game/occupational/level6/session1/poseUtils';
import type { ForceBaseline } from '@/components/game/occupational/level9/session1/forceUtils';
import {
  carryEffortScore,
  carryPoseForm,
  carryZoneStatus,
  trainChugScore,
  trainPoseForm,
  wallPushForceScore,
  wallPushPoseForm,
  gorillaPoseForm,
  gorillaPowerScore,
  mirroredGorillaHands,
  type CarryZoneStatus,
} from '@/components/game/occupational/level9/session4/heavyWorkUtils';
import {
  mirroredStrengthPalms,
  overheadHoldScore,
  strengthPoseForm,
} from '@/components/game/occupational/level9/session5/resistanceUtils';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export type EnduranceZoneStatus = CarryZoneStatus;

export { carryZoneStatus as enduranceZoneStatus };

export type EnergyTrailRound = {
  id: string;
  name: string;
  icon: string;
  waypoint: string;
  holdLabel: string;
};

/** Eight energy trail waypoints — escalating endurance holds. */
export const ENERGY_TRAIL_ROUNDS: EnergyTrailRound[] = [
  { id: 'spark-start', name: 'Spark Start', icon: '⚡', waypoint: 'Spark Node', holdLabel: 'CARRY' },
  { id: 'glow-path', name: 'Glow Path', icon: '💠', waypoint: 'Glow Node', holdLabel: 'CARRY' },
  { id: 'pulse-ridge', name: 'Pulse Ridge', icon: '🔷', waypoint: 'Pulse Node', holdLabel: 'CARRY' },
  { id: 'current-bend', name: 'Current Bend', icon: '💎', waypoint: 'Current Node', holdLabel: 'CARRY' },
  { id: 'voltage-vale', name: 'Voltage Vale', icon: '🔮', waypoint: 'Voltage Node', holdLabel: 'CARRY' },
  { id: 'plasma-pass', name: 'Plasma Pass', icon: '⭐', waypoint: 'Plasma Node', holdLabel: 'CARRY' },
  { id: 'nova-node', name: 'Nova Node', icon: '🌟', waypoint: 'Nova Node', holdLabel: 'CARRY' },
  { id: 'star-summit', name: 'Star Summit', icon: '✨', waypoint: 'Star Node', holdLabel: 'CARRY' },
];

export type EnduranceReadout = {
  form: number;
  effort: number;
  status: EnduranceZoneStatus;
  power: number;
};

/** @deprecated Use EnduranceReadout */
export type EnergyTrailReadout = EnduranceReadout;

/** Energy trail carry scoring — form + sustained effort in zone. */
export function energyTrailReadout(
  m: PostureMetrics,
  base: ForceBaseline,
  target: number,
  bandHalf: number,
): EnduranceReadout {
  const form = carryPoseForm(m, base);
  const effort = carryEffortScore(m, base);
  const status = carryZoneStatus(effort, target, bandHalf);
  const power = clamp01(form * 0.46 + effort * 0.54);
  return { form, effort, status, power };
}

/** Endurance stability from recent in-zone effort samples (1 = very steady). */
export function enduranceStabilityScore(samples: number[]): number {
  if (samples.length < 3) return 0.72;
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  const variance = samples.reduce((s, v) => s + (v - mean) ** 2, 0) / samples.length;
  const std = Math.sqrt(variance);
  return clamp01(1 - std / 0.14);
}

/** Movement quality for endurance hold rounds. */
export function enduranceHoldQuality(
  m: PostureMetrics,
  base: ForceBaseline,
  readout: EnduranceReadout,
  formMin: number,
  stability: number,
  controlled: number,
): number {
  const upright = uprightScore(m, base);
  const formOk = readout.form >= formMin ? 1 : readout.form / Math.max(0.2, formMin);
  const zoneOk = readout.status === 'zone' ? 1 : readout.status === 'light' ? 0.55 : 0.35;
  return clamp01(upright * 0.24 + formOk * 0.28 + zoneOk * 0.18 + stability * 0.18 + controlled * 0.12);
}

/** Combined endurance round score. */
export function enduranceRoundScore(power: number, stability: number): number {
  return clamp01(power * 0.62 + stability * 0.38);
}

/** @deprecated Use enduranceHoldQuality */
export const energyTrailQuality = enduranceHoldQuality;

/** @deprecated Use enduranceRoundScore */
export const energyTrailScore = enduranceRoundScore;

export type LongHaulTrainRound = {
  id: string;
  name: string;
  icon: string;
  station: string;
  chugLabel: string;
};

/** Eight long haul stations — escalating chug endurance holds. */
export const LONG_HAUL_TRAIN_ROUNDS: LongHaulTrainRound[] = [
  { id: 'coal-station', name: 'Coal Station', icon: '🚂', station: 'Coal Stop', chugLabel: 'CHUG' },
  { id: 'steam-bend', name: 'Steam Bend', icon: '💨', station: 'Steam Bend', chugLabel: 'CHUG' },
  { id: 'valley-pass', name: 'Valley Pass', icon: '🚃', station: 'Valley Stop', chugLabel: 'CHUG' },
  { id: 'ridge-tunnel', name: 'Ridge Tunnel', icon: '🛤️', station: 'Ridge Tunnel', chugLabel: 'CHUG' },
  { id: 'mountain-climb', name: 'Mountain Climb', icon: '⛰️', station: 'Mountain Pass', chugLabel: 'CHUG' },
  { id: 'night-express', name: 'Night Express', icon: '🌙', station: 'Night Stop', chugLabel: 'CHUG' },
  { id: 'summit-line', name: 'Summit Line', icon: '🌟', station: 'Summit Stop', chugLabel: 'CHUG' },
  { id: 'grand-terminal', name: 'Grand Terminal', icon: '🏁', station: 'Grand Terminal', chugLabel: 'CHUG' },
];

/** Long haul train chug scoring — lever form + sustained steam effort. */
export function longHaulTrainReadout(
  m: PostureMetrics,
  base: ForceBaseline,
  target: number,
  bandHalf: number,
): EnduranceReadout {
  const form = trainPoseForm(m, base);
  const effort = trainChugScore(m, base);
  const status = carryZoneStatus(effort, target, bandHalf);
  const power = clamp01(form * 0.46 + effort * 0.54);
  return { form, effort, status, power };
}

/** Combined long haul train round score. */
export function longHaulTrainScore(power: number, stability: number): number {
  return enduranceRoundScore(power, stability);
}

export type MountainPushRound = {
  id: string;
  name: string;
  icon: string;
  peak: string;
  pushLabel: string;
};

/** Eight mountain push peaks — escalating wall-push endurance holds. */
export const MOUNTAIN_PUSH_ROUNDS: MountainPushRound[] = [
  { id: 'base-camp', name: 'Base Camp', icon: '🪨', peak: 'Base Boulder', pushLabel: 'PUSH' },
  { id: 'ridge-push', name: 'Ridge Push', icon: '⛰️', peak: 'Ridge Boulder', pushLabel: 'PUSH' },
  { id: 'granite-wall', name: 'Granite Wall', icon: '🧱', peak: 'Granite Block', pushLabel: 'PUSH' },
  { id: 'summit-block', name: 'Summit Block', icon: '🏔️', peak: 'Summit Block', pushLabel: 'PUSH' },
  { id: 'eagle-peak', name: 'Eagle Peak', icon: '🦅', peak: 'Eagle Boulder', pushLabel: 'PUSH' },
  { id: 'cloud-crest', name: 'Cloud Crest', icon: '☁️', peak: 'Cloud Crest', pushLabel: 'PUSH' },
  { id: 'alpine-gate', name: 'Alpine Gate', icon: '🌲', peak: 'Alpine Gate', pushLabel: 'PUSH' },
  { id: 'mountain-crown', name: 'Mountain Crown', icon: '🏁', peak: 'Crown Peak', pushLabel: 'PUSH' },
];

/** Mountain push scoring — wall-push form + sustained bilateral thrust effort. */
export function mountainPushReadout(
  m: PostureMetrics,
  base: ForceBaseline,
  target: number,
  bandHalf: number,
): EnduranceReadout {
  const form = wallPushPoseForm(m, base);
  const effort = wallPushForceScore(m, base);
  const status = carryZoneStatus(effort, target, bandHalf);
  const power = clamp01(form * 0.44 + effort * 0.56);
  return { form, effort, status, power };
}

/** Combined mountain push round score. */
export function mountainPushScore(power: number, stability: number): number {
  return enduranceRoundScore(power, stability);
}

export type EnduranceQuestRound = {
  id: string;
  name: string;
  icon: string;
  checkpoint: string;
  holdLabel: string;
};

/** Eight endurance quest checkpoints — escalating overhead brace holds. */
export const ENDURANCE_QUEST_ROUNDS: EnduranceQuestRound[] = [
  { id: 'gate-valor', name: 'Gate of Valor', icon: '🗡️', checkpoint: 'Valor Gate', holdLabel: 'BRACE' },
  { id: 'shield-bridge', name: 'Shield Bridge', icon: '🛡️', checkpoint: 'Shield Bridge', holdLabel: 'BRACE' },
  { id: 'crystal-vault', name: 'Crystal Vault', icon: '💎', checkpoint: 'Crystal Vault', holdLabel: 'BRACE' },
  { id: 'dragon-pass', name: "Dragon's Pass", icon: '🐉', checkpoint: 'Dragon Pass', holdLabel: 'BRACE' },
  { id: 'moon-shrine', name: 'Moonlit Shrine', icon: '🌙', checkpoint: 'Moon Shrine', holdLabel: 'BRACE' },
  { id: 'star-arch', name: 'Starlit Arch', icon: '⭐', checkpoint: 'Star Arch', holdLabel: 'BRACE' },
  { id: 'crown-chamber', name: 'Crown Chamber', icon: '👑', checkpoint: 'Crown Chamber', holdLabel: 'BRACE' },
  { id: 'legend-end', name: "Legend's End", icon: '🏁', checkpoint: "Legend's End", holdLabel: 'BRACE' },
];

/** Endurance quest scoring — overhead brace form + sustained pillar hold effort. */
export function enduranceQuestReadout(
  m: PostureMetrics,
  base: ForceBaseline,
  target: number,
  bandHalf: number,
): EnduranceReadout {
  const form = strengthPoseForm(m, base);
  const effort = overheadHoldScore(m, base);
  const status = carryZoneStatus(effort, target, bandHalf);
  const power = clamp01(form * 0.48 + effort * 0.52);
  return { form, effort, status, power };
}

/** Combined endurance quest round score. */
export function enduranceQuestScore(power: number, stability: number): number {
  return enduranceRoundScore(power, stability);
}

export { mirroredStrengthPalms };

export type PowerMarathonRound = {
  id: string;
  name: string;
  icon: string;
  mile: string;
  holdLabel: string;
};

/** Eight power marathon miles — escalating gorilla power endurance holds. */
export const POWER_MARATHON_ROUNDS: PowerMarathonRound[] = [
  { id: 'start-line', name: 'Start Line', icon: '🏃', mile: 'Mile 1', holdLabel: 'POWER' },
  { id: 'thunder-hill', name: 'Thunder Hill', icon: '⛈️', mile: 'Mile 2', holdLabel: 'POWER' },
  { id: 'power-pass', name: 'Power Pass', icon: '💪', mile: 'Mile 3', holdLabel: 'POWER' },
  { id: 'jungle-curve', name: 'Jungle Curve', icon: '🌴', mile: 'Mile 4', holdLabel: 'POWER' },
  { id: 'energy-ridge', name: 'Energy Ridge', icon: '⚡', mile: 'Mile 5', holdLabel: 'POWER' },
  { id: 'beast-sprint', name: 'Beast Sprint', icon: '🦍', mile: 'Mile 6', holdLabel: 'POWER' },
  { id: 'final-push', name: 'Final Push', icon: '🔥', mile: 'Mile 7', holdLabel: 'POWER' },
  { id: 'finish-line', name: 'Finish Line', icon: '🏁', mile: 'Mile 8', holdLabel: 'POWER' },
];

/** Power marathon scoring — gorilla pose form + sustained chest-beat power effort. */
export function powerMarathonReadout(
  m: PostureMetrics,
  base: ForceBaseline,
  target: number,
  bandHalf: number,
): EnduranceReadout {
  const form = gorillaPoseForm(m, base);
  const effort = gorillaPowerScore(m, base);
  const status = carryZoneStatus(effort, target, bandHalf);
  const power = clamp01(form * 0.46 + effort * 0.54);
  return { form, effort, status, power };
}

/** Combined power marathon round score. */
export function powerMarathonScore(power: number, stability: number): number {
  return enduranceRoundScore(power, stability);
}

export { mirroredGorillaHands };
