import { StabilitySmoothingSystem } from './StabilitySmoothingSystem';
import { ResistancePoseSystem, type ResistancePose } from './ResistancePoseSystem';
import type { LipResistanceSnapshot } from './lipResistanceTypes';

export const UPPER_LIP_INDEX = 13;
export const LOWER_LIP_INDEX = 17;
export const LEFT_LIP_CORNER_INDEX = 61;
export const RIGHT_LIP_CORNER_INDEX = 291;

export const ALLOWED_BREAK_MS = 500;
export const STABLE_MOVEMENT_THRESHOLD = 3;

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function metricsFromLandmarks(
  upper: { x: number; y: number } | null | undefined,
  lower: { x: number; y: number } | null | undefined,
  left: { x: number; y: number } | null | undefined,
  right: { x: number; y: number } | null | undefined,
) {
  if (!upper || !lower || !left || !right) return null;
  const mouthWidth = dist(left, right);
  const mouthHeight = dist(upper, lower);
  if (mouthWidth < 0.001 || mouthHeight < 0.001) return null;
  return {
    lipGap: mouthHeight * 1000,
    roundness: mouthHeight / mouthWidth,
    spread: mouthWidth / mouthHeight,
    mouthWidth: mouthWidth * 1000,
    mouthHeight: mouthHeight * 1000,
  };
}

/**
 * Simulates lip resistance via posture stability + endurance timing.
 * resistanceScore ≈ stability × holdDuration (normalized).
 */
export class LipResistanceEngine {
  private poseSystem = new ResistancePoseSystem();
  private movementSmoother = new StabilitySmoothingSystem(5);
  private prevW = 0;
  private prevH = 0;
  private hasPrev = false;
  private holdStart: number | null = null;
  private holdDuration = 0;
  private pausedHoldMs = 0;
  private breakStart: number | null = null;
  private unstableFrames = 0;
  private microBreaks = 0;
  private recoveryCount = 0;
  private stablePose: ResistancePose = 'NEUTRAL';

  reset() {
    this.poseSystem.reset();
    this.movementSmoother.reset();
    this.prevW = 0;
    this.prevH = 0;
    this.hasPrev = false;
    this.holdStart = null;
    this.holdDuration = 0;
    this.pausedHoldMs = 0;
    this.breakStart = null;
    this.unstableFrames = 0;
    this.microBreaks = 0;
    this.recoveryCount = 0;
    this.stablePose = 'NEUTRAL';
  }

  processMetrics(
    lipGap: number | null,
    roundness: number | null,
    spread: number | null,
    mouthWidth: number | null,
    mouthHeight: number | null,
    now = Date.now(),
  ): LipResistanceSnapshot {
    if (
      lipGap == null ||
      roundness == null ||
      spread == null ||
      mouthWidth == null ||
      mouthHeight == null
    ) {
      this.unstableFrames += 1;
      return this.snapshot(now, 0, 0, true, false);
    }

    this.unstableFrames = Math.max(0, this.unstableFrames - 1);
    const { pose } = this.poseSystem.push(lipGap, roundness, spread);

    let movement = 0;
    if (this.hasPrev) {
      movement = Math.abs(mouthWidth - this.prevW) + Math.abs(mouthHeight - this.prevH);
    }
    this.prevW = mouthWidth;
    this.prevH = mouthHeight;
    this.hasPrev = true;

    const { smoothedMovement, stableHold: lowMovement } = this.movementSmoother.push(movement);
    const stabilityScore = Math.min(1, Math.max(0, 1 - smoothedMovement / 12));
    const postureActive = pose !== 'NEUTRAL';
    const stableHoldRaw = postureActive && lowMovement && stabilityScore > 0.45;

    const inGracePeriod = this.updateHold(stableHoldRaw, pose, now);
    const stableHold = stableHoldRaw || inGracePeriod;
    const resistanceScore = stabilityScore * Math.min(1, this.holdDuration / 8000);

    return {
      lipPose: pose,
      stableHold,
      stabilityScore,
      holdDuration: this.holdDuration,
      resistanceScore,
      confidence: Math.min(1, Math.max(0.35, 1 - this.unstableFrames / 20)),
      unstable: this.unstableFrames > 8,
      inGracePeriod,
      microBreaks: this.microBreaks,
    };
  }

  private updateHold(stable: boolean, pose: ResistancePose, now: number): boolean {
    if (stable) {
      if (this.breakStart != null) {
        if (now - this.breakStart <= ALLOWED_BREAK_MS) {
          this.recoveryCount += 1;
          this.breakStart = null;
          if (this.holdStart == null) this.holdStart = now - this.pausedHoldMs;
          this.holdDuration = now - this.holdStart;
          this.stablePose = pose;
          return true;
        }
        this.microBreaks += 1;
      }
      this.breakStart = null;
      if (this.holdStart == null) this.holdStart = now;
      this.holdDuration = now - this.holdStart;
      this.pausedHoldMs = this.holdDuration;
      this.stablePose = pose;
      return false;
    }

    if (this.holdStart != null && this.breakStart == null) {
      this.breakStart = now;
      this.pausedHoldMs = this.holdDuration;
    }
    if (this.breakStart != null && now - this.breakStart > ALLOWED_BREAK_MS) {
      this.holdStart = null;
      this.holdDuration = 0;
      this.pausedHoldMs = 0;
    }
    return this.breakStart != null && now - this.breakStart <= ALLOWED_BREAK_MS;
  }

  private snapshot(
    _now: number,
    stabilityScore: number,
    holdDuration: number,
    unstable: boolean,
    inGracePeriod: boolean,
  ): LipResistanceSnapshot {
    return {
      lipPose: this.poseSystem.current,
      stableHold: this.movementSmoother.stable || inGracePeriod,
      stabilityScore,
      holdDuration,
      resistanceScore: stabilityScore * Math.min(1, holdDuration / 8000),
      confidence: Math.max(0, 1 - this.unstableFrames / 15),
      unstable,
      inGracePeriod,
      microBreaks: this.microBreaks,
    };
  }
}

export type { ResistancePose };
