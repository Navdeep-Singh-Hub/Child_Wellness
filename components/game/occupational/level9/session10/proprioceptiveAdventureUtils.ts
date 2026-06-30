/**
 * OT Level 9 · Session 10 — Proprioceptive Adventure pose math.
 */
import { uprightScore, type PostureMetrics } from '@/components/game/occupational/level6/session1/poseUtils';
import type { ForceBaseline } from '@/components/game/occupational/level9/session1/forceUtils';
import {
  carryEffortScore,
  carryPoseForm,
  carryZoneStatus,
  mirroredCarryHands,
  wallPushForceScore,
  wallPushPoseForm,
  gorillaArmRaise,
  gorillaBeatHeight,
  gorillaPoseForm,
  gorillaPowerScore,
  gorillaPowerStance,
  mirroredGorillaHands,
  type CarryZoneStatus,
} from '@/components/game/occupational/level9/session4/heavyWorkUtils';
import { mirroredPushPalms } from '@/components/game/occupational/level9/session1/forceUtils';
import {
  mirroredShipRopes,
  mirroredStrengthPalms,
  overheadHoldScore,
  shipAnchorStance,
  shipPullPoseForm,
  shipPullScore,
  shipRopeHeight,
  shipTowBend,
  strengthArmExtension,
  strengthColosseumStance,
  strengthOverheadHeight,
  strengthPoseForm,
} from '@/components/game/occupational/level9/session5/resistanceUtils';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export type AdventureZoneStatus = CarryZoneStatus;

export type AdventureReadout = {
  form: number;
  effort: number;
  status: AdventureZoneStatus;
  power: number;
};

export type JungleWorksiteRound = {
  id: string;
  name: string;
  icon: string;
  site: string;
  haulLabel: string;
};

/** Eight jungle worksite haul stations. */
export const JUNGLE_WORKSITE_ROUNDS: JungleWorksiteRound[] = [
  { id: 'sapling-yard', name: 'Sapling Yard', icon: '🌱', site: 'Sapling Post', haulLabel: 'HAUL' },
  { id: 'vine-bridge', name: 'Vine Bridge', icon: '🌿', site: 'Vine Crossing', haulLabel: 'HAUL' },
  { id: 'timber-stack', name: 'Timber Stack', icon: '🪵', site: 'Timber Stack', haulLabel: 'HAUL' },
  { id: 'canopy-camp', name: 'Canopy Camp', icon: '🌴', site: 'Canopy Camp', haulLabel: 'HAUL' },
  { id: 'root-workshop', name: 'Root Workshop', icon: '🦎', site: 'Root Workshop', haulLabel: 'HAUL' },
  { id: 'hammock-post', name: 'Hammock Post', icon: '🪢', site: 'Hammock Post', haulLabel: 'HAUL' },
  { id: 'canopy-crane', name: 'Canopy Crane', icon: '🏗️', site: 'Canopy Crane', haulLabel: 'HAUL' },
  { id: 'jungle-gate', name: 'Jungle Gate', icon: '🏁', site: 'Jungle Gate', haulLabel: 'HAUL' },
];

/** Jungle worksite carry scoring — form + sustained haul effort in zone. */
export function jungleWorksiteReadout(
  m: PostureMetrics,
  base: ForceBaseline,
  target: number,
  bandHalf: number,
): AdventureReadout {
  const form = carryPoseForm(m, base);
  const effort = carryEffortScore(m, base);
  const status = carryZoneStatus(effort, target, bandHalf);
  const power = clamp01(form * 0.46 + effort * 0.54);
  return { form, effort, status, power };
}

/** Movement quality for jungle worksite haul rounds. */
export function adventureHaulQuality(
  m: PostureMetrics,
  base: ForceBaseline,
  readout: AdventureReadout,
  formMin: number,
  controlled: number,
  positioned: boolean,
): number {
  const formOk = readout.form >= formMin ? 1 : readout.form / Math.max(0.2, formMin);
  const zoneOk = readout.status === 'zone' ? 1 : readout.status === 'light' ? 0.55 : 0.35;
  const upright = uprightScore(m, base);
  return clamp01((positioned ? 0.42 : 0.2) + upright * 0.12 + formOk * 0.22 + zoneOk * 0.16 + controlled * 0.1);
}

/** Combined jungle worksite round score. */
export function jungleWorksiteScore(power: number): number {
  return clamp01(power);
}

export { mirroredCarryHands };

export type SpaceBuilderRound = {
  id: string;
  name: string;
  icon: string;
  module: string;
  pushLabel: string;
};

/** Eight orbital construction modules — escalating install holds. */
export const SPACE_BUILDER_ROUNDS: SpaceBuilderRound[] = [
  { id: 'dock-bay', name: 'Dock Bay', icon: '🚀', module: 'Dock Module', pushLabel: 'PUSH' },
  { id: 'hull-panel', name: 'Hull Panel', icon: '🛸', module: 'Hull Panel', pushLabel: 'PUSH' },
  { id: 'solar-array', name: 'Solar Array', icon: '☀️', module: 'Solar Array', pushLabel: 'PUSH' },
  { id: 'airlock', name: 'Airlock', icon: '🚪', module: 'Airlock Seal', pushLabel: 'PUSH' },
  { id: 'command-deck', name: 'Command Deck', icon: '🎛️', module: 'Command Deck', pushLabel: 'PUSH' },
  { id: 'cargo-bay', name: 'Cargo Bay', icon: '📦', module: 'Cargo Bay', pushLabel: 'PUSH' },
  { id: 'engine-core', name: 'Engine Core', icon: '⚙️', module: 'Engine Core', pushLabel: 'PUSH' },
  { id: 'station-complete', name: 'Station Complete', icon: '🏁', module: 'Final Module', pushLabel: 'PUSH' },
];

/** Space builder scoring — wall-push form + sustained module install effort. */
export function spaceBuilderReadout(
  m: PostureMetrics,
  base: ForceBaseline,
  target: number,
  bandHalf: number,
): AdventureReadout {
  const form = wallPushPoseForm(m, base);
  const effort = wallPushForceScore(m, base);
  const status = carryZoneStatus(effort, target, bandHalf);
  const power = clamp01(form * 0.44 + effort * 0.56);
  return { form, effort, status, power };
}

/** Movement quality for space builder push rounds. */
export function adventurePushQuality(
  m: PostureMetrics,
  base: ForceBaseline,
  readout: AdventureReadout,
  formMin: number,
  controlled: number,
  positioned: boolean,
): number {
  const formOk = readout.form >= formMin ? 1 : readout.form / Math.max(0.2, formMin);
  const zoneOk = readout.status === 'zone' ? 1 : readout.status === 'light' ? 0.55 : 0.35;
  const upright = uprightScore(m, base);
  return clamp01((positioned ? 0.42 : 0.2) + upright * 0.12 + formOk * 0.22 + zoneOk * 0.16 + controlled * 0.1);
}

/** Combined space builder round score. */
export function spaceBuilderScore(power: number): number {
  return clamp01(power);
}

export { mirroredPushPalms };

export type PirateCargoMissionRound = {
  id: string;
  name: string;
  icon: string;
  crate: string;
  pullLabel: string;
};

/** Eight smuggler cargo crates — escalating hoist holds. */
export const PIRATE_CARGO_MISSION_ROUNDS: PirateCargoMissionRound[] = [
  { id: 'spice-crate', name: 'Spice Crate', icon: '📦', crate: 'Spice Crate', pullLabel: 'PULL' },
  { id: 'cannon-barrel', name: 'Cannon Barrel', icon: '🛢️', crate: 'Cannon Barrel', pullLabel: 'PULL' },
  { id: 'treasure-chest', name: 'Treasure Chest', icon: '💎', crate: 'Treasure Chest', pullLabel: 'PULL' },
  { id: 'rum-barrel', name: 'Rum Barrel', icon: '🍾', crate: 'Rum Barrel', pullLabel: 'PULL' },
  { id: 'anchor-chain', name: 'Anchor Chain', icon: '⛓️', crate: 'Anchor Chain', pullLabel: 'PULL' },
  { id: 'gold-hoard', name: 'Gold Hoard', icon: '💰', crate: 'Gold Hoard', pullLabel: 'PULL' },
  { id: 'map-case', name: 'Map Case', icon: '🗺️', crate: 'Map Case', pullLabel: 'PULL' },
  { id: 'captains-loot', name: 'Captain\'s Loot', icon: '🏁', crate: 'Captain\'s Loot', pullLabel: 'PULL' },
];

/** Pirate cargo scoring — tow-rope pose + sustained hoist pull effort. */
export function pirateCargoReadout(
  m: PostureMetrics,
  base: ForceBaseline,
  target: number,
  bandHalf: number,
): AdventureReadout {
  const form = shipPullPoseForm(m, base);
  const effort = shipPullScore(m, base);
  const status = carryZoneStatus(effort, target, bandHalf);
  const power = clamp01(form * 0.46 + effort * 0.54);
  return { form, effort, status, power };
}

/** Movement quality for pirate cargo hoist rounds. */
export function adventurePullQuality(
  m: PostureMetrics,
  base: ForceBaseline,
  readout: AdventureReadout,
  formMin: number,
  controlled: number,
  positioned: boolean,
): number {
  const formOk = readout.form >= formMin ? 1 : readout.form / Math.max(0.2, formMin);
  const zoneOk = readout.status === 'zone' ? 1 : readout.status === 'light' ? 0.55 : 0.35;
  const upright = uprightScore(m, base);
  const anchor = shipAnchorStance(m);
  return clamp01((positioned ? 0.38 : 0.18) + upright * 0.1 + anchor * 0.08 + formOk * 0.22 + zoneOk * 0.16 + controlled * 0.1);
}

/** Combined pirate cargo round score. */
export function pirateCargoScore(power: number): number {
  return clamp01(power);
}

export { mirroredShipRopes, shipAnchorStance, shipRopeHeight, shipTowBend };

export type MountainRescueRound = {
  id: string;
  name: string;
  icon: string;
  ledge: string;
  braceLabel: string;
};

/** Eight alpine rescue ledges — escalating overhead brace holds. */
export const MOUNTAIN_RESCUE_ROUNDS: MountainRescueRound[] = [
  { id: 'base-camp', name: 'Base Camp', icon: '🏕️', ledge: 'Base Camp', braceLabel: 'BRACE' },
  { id: 'rocky-ledge', name: 'Rocky Ledge', icon: '🪨', ledge: 'Rocky Ledge', braceLabel: 'BRACE' },
  { id: 'ice-shelf', name: 'Ice Shelf', icon: '🧊', ledge: 'Ice Shelf', braceLabel: 'BRACE' },
  { id: 'eagle-ridge', name: 'Eagle Ridge', icon: '🦅', ledge: 'Eagle Ridge', braceLabel: 'BRACE' },
  { id: 'cloud-pass', name: 'Cloud Pass', icon: '☁️', ledge: 'Cloud Pass', braceLabel: 'BRACE' },
  { id: 'summit-ledge', name: 'Summit Ledge', icon: '⛰️', ledge: 'Summit Ledge', braceLabel: 'BRACE' },
  { id: 'avalanche-zone', name: 'Avalanche Zone', icon: '🌨️', ledge: 'Avalanche Zone', braceLabel: 'BRACE' },
  { id: 'rescue-complete', name: 'Rescue Complete', icon: '🏁', ledge: 'Final Rescue', braceLabel: 'BRACE' },
];

/** Mountain rescue scoring — overhead brace form + sustained rope hold effort. */
export function mountainRescueReadout(
  m: PostureMetrics,
  base: ForceBaseline,
  target: number,
  bandHalf: number,
): AdventureReadout {
  const form = strengthPoseForm(m, base);
  const effort = overheadHoldScore(m, base);
  const status = carryZoneStatus(effort, target, bandHalf);
  const power = clamp01(form * 0.48 + effort * 0.52);
  return { form, effort, status, power };
}

/** Movement quality for mountain rescue brace rounds. */
export function adventureBraceQuality(
  m: PostureMetrics,
  base: ForceBaseline,
  readout: AdventureReadout,
  formMin: number,
  controlled: number,
  positioned: boolean,
): number {
  const formOk = readout.form >= formMin ? 1 : readout.form / Math.max(0.2, formMin);
  const zoneOk = readout.status === 'zone' ? 1 : readout.status === 'light' ? 0.55 : 0.35;
  const upright = uprightScore(m, base);
  const stance = strengthColosseumStance(m);
  return clamp01((positioned ? 0.38 : 0.18) + upright * 0.12 + stance * 0.08 + formOk * 0.22 + zoneOk * 0.16 + controlled * 0.1);
}

/** Combined mountain rescue round score. */
export function mountainRescueScore(power: number): number {
  return clamp01(power);
}

export { mirroredStrengthPalms, strengthArmExtension, strengthColosseumStance, strengthOverheadHeight };

export type ProprioceptionChampionRound = {
  id: string;
  name: string;
  icon: string;
  trial: string;
  powerLabel: string;
};

/** Eight champion colosseum trials — escalating power holds. */
export const PROPRIOCEPTION_CHAMPION_ROUNDS: ProprioceptionChampionRound[] = [
  { id: 'bronze-gate', name: 'Bronze Gate', icon: '🥉', trial: 'Bronze Trial', powerLabel: 'POWER' },
  { id: 'silver-arena', name: 'Silver Arena', icon: '🥈', trial: 'Silver Trial', powerLabel: 'POWER' },
  { id: 'gold-colosseum', name: 'Gold Colosseum', icon: '🥇', trial: 'Gold Trial', powerLabel: 'POWER' },
  { id: 'force-trial', name: 'Force Trial', icon: '💪', trial: 'Force Trial', powerLabel: 'POWER' },
  { id: 'balance-trial', name: 'Balance Trial', icon: '⚡', trial: 'Balance Trial', powerLabel: 'POWER' },
  { id: 'mastery-trial', name: 'Mastery Trial', icon: '🌟', trial: 'Mastery Trial', powerLabel: 'POWER' },
  { id: 'champion-peak', name: 'Champion Peak', icon: '👑', trial: 'Champion Peak', powerLabel: 'POWER' },
  { id: 'proprio-crown', name: 'Proprio Crown', icon: '🏁', trial: 'Final Crown', powerLabel: 'POWER' },
];

/** Champion scoring — gorilla power pose + sustained champion hold effort. */
export function proprioceptionChampionReadout(
  m: PostureMetrics,
  base: ForceBaseline,
  target: number,
  bandHalf: number,
): AdventureReadout {
  const form = gorillaPoseForm(m, base);
  const effort = gorillaPowerScore(m, base);
  const status = carryZoneStatus(effort, target, bandHalf);
  const power = clamp01(form * 0.46 + effort * 0.54);
  return { form, effort, status, power };
}

/** Movement quality for champion power hold rounds. */
export function adventurePowerQuality(
  m: PostureMetrics,
  base: ForceBaseline,
  readout: AdventureReadout,
  formMin: number,
  controlled: number,
  positioned: boolean,
): number {
  const formOk = readout.form >= formMin ? 1 : readout.form / Math.max(0.2, formMin);
  const zoneOk = readout.status === 'zone' ? 1 : readout.status === 'light' ? 0.55 : 0.35;
  const upright = uprightScore(m, base);
  const stance = gorillaPowerStance(m);
  return clamp01((positioned ? 0.38 : 0.18) + upright * 0.1 + stance * 0.1 + formOk * 0.22 + zoneOk * 0.16 + controlled * 0.1);
}

/** Combined proprioception champion round score. */
export function proprioceptionChampionScore(power: number): number {
  return clamp01(power);
}

export { mirroredGorillaHands, gorillaArmRaise, gorillaBeatHeight, gorillaPowerStance };
