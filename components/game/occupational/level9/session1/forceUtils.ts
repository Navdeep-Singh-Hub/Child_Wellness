/**
 * OT Level 9 · Session 1 — Force Awareness pose math.
 * Estimates press / squeeze force from wrist landmarks (MediaPipe, normalized 0..1).
 */
import {
  averageBaseline,
  type PostureBaseline,
  type PostureMetrics,
} from '@/components/game/occupational/level6/session1/poseUtils';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export type ForceBaseline = PostureBaseline & {
  /** Relaxed wrist spread / shoulder width. */
  wristSpreadNorm: number;
  /** Relaxed forward-press proxy (0..1). */
  wristForwardNorm: number;
};

export const DEFAULT_FORCE_BASELINE: ForceBaseline = {
  trunkLeanDeg: 0,
  shoulderTiltDeg: 0,
  headTiltDeg: 0,
  headOffsetNorm: 0,
  elongationNorm: 1,
  headPitchNorm: 0,
  comX: 0.5,
  comY: 0.55,
  shoulderWidthBase: 0.25,
  wristSpreadNorm: 1.2,
  wristForwardNorm: 0.15,
};

/** Distance between wrists normalized by shoulder width. */
export function wristSpreadNorm(m: PostureMetrics): number {
  if (!m.leftWrist || !m.rightWrist || m.shoulderWidth < 0.05) return 1.5;
  return Math.hypot(m.leftWrist.x - m.rightWrist.x, m.leftWrist.y - m.rightWrist.y) / m.shoulderWidth;
}

/** How far wrists are pressed inward toward body midline (0 = wide, 1 = squeezed). */
export function squeezeScore(m: PostureMetrics, base: ForceBaseline): number {
  const spread = wristSpreadNorm(m);
  const delta = base.wristSpreadNorm - spread;
  const range = Math.max(0.2, base.wristSpreadNorm * 0.55);
  return clamp01(delta / range);
}

/**
 * Forward press proxy: wrists move toward shoulder line and upward (push toward camera).
 * Uses absolute normalized landmark coordinates.
 */
export function forwardPressScore(m: PostureMetrics, base: ForceBaseline): number {
  const sm = m.shoulderMid;
  const sw = Math.max(0.12, m.shoulderWidth);
  let sum = 0;
  let n = 0;
  for (const w of [m.leftWrist, m.rightWrist]) {
    if (!w) continue;
    const inward = clamp01(1 - Math.abs(w.x - sm.x) / (sw * 0.5));
    const raised = clamp01(1 - (w.y - sm.y) / (sw * 1.1));
    sum += inward * 0.5 + raised * 0.5;
    n++;
  }
  if (n === 0) return 0;
  const raw = sum / n;
  const headroom = Math.max(0.25, 1 - base.wristForwardNorm);
  return clamp01((raw - base.wristForwardNorm) / headroom);
}

/** Combined press force 0..1 for balloon inflation. */
export function pressForceScore(m: PostureMetrics, base: ForceBaseline): number {
  const squeeze = squeezeScore(m, base);
  const forward = forwardPressScore(m, base);
  return clamp01(squeeze * 0.52 + forward * 0.48);
}

export function averageForceBaseline(samples: PostureMetrics[]): ForceBaseline {
  const posture = averageBaseline(samples);
  let spreadSum = 0;
  let forwardSum = 0;
  let n = 0;
  for (const s of samples) {
    if (!s.present) continue;
    spreadSum += wristSpreadNorm(s);
    const sm = s.shoulderMid;
    const sw = Math.max(0.12, s.shoulderWidth);
    let f = 0;
    let fn = 0;
    for (const w of [s.leftWrist, s.rightWrist]) {
      if (!w) continue;
      const inward = clamp01(1 - Math.abs(w.x - sm.x) / (sw * 0.5));
      const raised = clamp01(1 - (w.y - sm.y) / (sw * 1.1));
      f += inward * 0.5 + raised * 0.5;
      fn++;
    }
    forwardSum += fn > 0 ? f / fn : 0.15;
    n++;
  }
  const denom = Math.max(1, n);
  return {
    ...posture,
    wristSpreadNorm: spreadSum / denom || DEFAULT_FORCE_BASELINE.wristSpreadNorm,
    wristForwardNorm: forwardSum / denom || DEFAULT_FORCE_BASELINE.wristForwardNorm,
  };
}

/** Mirrored screen anchors for selfie preview. */
export function mirroredWrists(m: PostureMetrics): { left: { x: number; y: number } | null; right: { x: number; y: number } | null } {
  return {
    left: m.leftWrist ? { x: 1 - m.leftWrist.x, y: m.leftWrist.y } : null,
    right: m.rightWrist ? { x: 1 - m.rightWrist.x, y: m.rightWrist.y } : null,
  };
}

/** Per-wrist forward extension toward camera (0..1 raw, before baseline). */
export function wristForwardExtension(m: PostureMetrics): number {
  const sm = m.shoulderMid;
  const sw = Math.max(0.12, m.shoulderWidth);
  let sum = 0;
  let n = 0;
  for (const w of [m.leftWrist, m.rightWrist]) {
    if (!w) continue;
    const raised = clamp01((sm.y - w.y) / (sw * 0.9));
    const outward = clamp01(Math.abs(w.x - sm.x) / (sw * 0.58));
    sum += raised * 0.72 + outward * 0.28;
    n++;
  }
  return n ? sum / n : 0;
}

/** Bilateral symmetry of forward push between left and right wrists. */
export function bilateralPushSymmetry(m: PostureMetrics): number {
  if (!m.leftWrist || !m.rightWrist) return 0;
  const sm = m.shoulderMid;
  const sw = Math.max(0.12, m.shoulderWidth);
  const lPush = (sm.y - m.leftWrist.y) / sw;
  const rPush = (sm.y - m.rightWrist.y) / sw;
  return clamp01(1 - Math.abs(lPush - rPush) / 0.38);
}

/**
 * Rocket Push force — forward bilateral palm thrust (not squeeze).
 * Uses absolute normalized landmark coordinates vs calibrated baseline.
 */
export function rocketPushForceScore(m: PostureMetrics, base: ForceBaseline): number {
  const raw = wristForwardExtension(m);
  const headroom = Math.max(0.22, 1 - base.wristForwardNorm);
  const forward = clamp01((raw - base.wristForwardNorm) / headroom);
  const symmetry = bilateralPushSymmetry(m);
  return clamp01(forward * 0.68 + symmetry * 0.32);
}

/** Mirrored palm push anchors with spread hint for overlay. */
export function mirroredPushPalms(m: PostureMetrics): {
  left: { x: number; y: number } | null;
  right: { x: number; y: number } | null;
} {
  return mirroredWrists(m);
}

/** How evenly left and right wrists approach the body midline when squeezing. */
export function bilateralSqueezeSymmetry(m: PostureMetrics): number {
  if (!m.leftWrist || !m.rightWrist) return 0;
  const sm = m.shoulderMid.x;
  const sw = Math.max(0.12, m.shoulderWidth);
  const lDist = Math.abs(m.leftWrist.x - sm);
  const rDist = Math.abs(m.rightWrist.x - sm);
  return clamp01(1 - Math.abs(lDist - rDist) / (sw * 0.28));
}

/** Both wrists at similar height — important for two-hand berry squish. */
export function wristHeightMatch(m: PostureMetrics): number {
  if (!m.leftWrist || !m.rightWrist) return 0;
  const sw = Math.max(0.12, m.shoulderWidth);
  return clamp01(1 - Math.abs(m.leftWrist.y - m.rightWrist.y) / (sw * 0.35));
}

/**
 * Berry Squish force — bilateral hand squeeze (not forward push).
 * Uses absolute normalized landmark coordinates vs calibrated baseline.
 */
export function berrySquishForceScore(m: PostureMetrics, base: ForceBaseline): number {
  const squeeze = squeezeScore(m, base);
  const symmetry = bilateralSqueezeSymmetry(m);
  const level = wristHeightMatch(m);
  return clamp01(squeeze * 0.68 + symmetry * 0.2 + level * 0.12);
}

/** Wrists held at chest charge height (between shoulders and hips). */
export function chestChargeHeight(m: PostureMetrics): number {
  if (!m.leftWrist || !m.rightWrist) return 0;
  const sm = m.shoulderMid;
  const hm = m.hipMid;
  const chestY = sm.y + (hm.y - sm.y) * 0.38;
  const sw = Math.max(0.12, m.shoulderWidth);
  let sum = 0;
  let n = 0;
  for (const w of [m.leftWrist, m.rightWrist]) {
    sum += clamp01(1 - Math.abs(w.y - chestY) / (sw * 0.55));
    n++;
  }
  return n ? sum / n : 0;
}

/** Moderate hand spread at chest — ideal charge clutch distance. */
export function chestChargeSpread(m: PostureMetrics, base: ForceBaseline): number {
  const spread = wristSpreadNorm(m);
  const ideal = base.wristSpreadNorm * 0.55;
  const delta = Math.abs(spread - ideal);
  return clamp01(1 - delta / Math.max(0.15, base.wristSpreadNorm * 0.35));
}

export type EnergyZoneStatus = 'low' | 'zone' | 'high';

export function energyZoneStatus(force: number, target: number, bandHalf: number): EnergyZoneStatus {
  if (force < target - bandHalf) return 'low';
  if (force > target + bandHalf) return 'high';
  return 'zone';
}

/**
 * Energy Meter charge — graded chest-level sustained effort.
 * Uses absolute normalized landmark coordinates vs calibrated baseline.
 */
export function energyChargeScore(m: PostureMetrics, base: ForceBaseline): number {
  const squeeze = squeezeScore(m, base);
  const forward = forwardPressScore(m, base);
  const height = chestChargeHeight(m);
  const spread = chestChargeSpread(m, base);
  const symmetry = bilateralSqueezeSymmetry(m);
  return clamp01(squeeze * 0.28 + forward * 0.22 + height * 0.25 + spread * 0.15 + symmetry * 0.1);
}

export type MatchDirection = 'low' | 'matched' | 'high';

export function matchDirection(player: number, target: number, tolerance: number): MatchDirection {
  if (player < target - tolerance) return 'low';
  if (player > target + tolerance) return 'high';
  return 'matched';
}

export function forceMatchDelta(player: number, target: number): number {
  return Math.abs(player - target);
}

export function forceMatchAccuracy(player: number, target: number, tolerance: number): number {
  const delta = forceMatchDelta(player, target);
  return clamp01(1 - delta / Math.max(tolerance, 0.08));
}

/**
 * Match The Force — balanced general effort output for replicating target levels.
 * Uses absolute normalized landmark coordinates vs calibrated baseline.
 */
export function matchForceScore(m: PostureMetrics, base: ForceBaseline): number {
  const squeeze = squeezeScore(m, base);
  const forward = forwardPressScore(m, base);
  const ext = wristForwardExtension(m);
  const headroom = Math.max(0.22, 1 - base.wristForwardNorm);
  const extNorm = clamp01((ext - base.wristForwardNorm) / headroom);
  const symmetry = bilateralSqueezeSymmetry(m);
  return clamp01(squeeze * 0.38 + forward * 0.32 + extNorm * 0.18 + symmetry * 0.12);
}
