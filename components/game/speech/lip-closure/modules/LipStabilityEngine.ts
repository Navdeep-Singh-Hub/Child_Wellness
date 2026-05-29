import { StabilitySmoothingSystem } from './StabilitySmoothingSystem';
import type { LipGeometry, LipStabilitySnapshot } from './lipHoldTypes';

export const UPPER_LIP_INDEX = 13;
export const LOWER_LIP_INDEX = 17;
export const LEFT_LIP_CORNER_INDEX = 61;
export const RIGHT_LIP_CORNER_INDEX = 291;

export const ALLOWED_BREAK_MS = 400;

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function geometryFromLandmarks(
  upper: { x: number; y: number } | null | undefined,
  lower: { x: number; y: number } | null | undefined,
  left: { x: number; y: number } | null | undefined,
  right: { x: number; y: number } | null | undefined,
): LipGeometry | null {
  if (!upper || !lower || !left || !right) return null;
  return {
    mouthWidth: dist(left, right) * 1000,
    mouthHeight: dist(upper, lower) * 1000,
  };
}

/**
 * Tracks lip posture stability via mouth width/height delta only.
 * Ignores tiny jitter; allows brief breaks up to ALLOWED_BREAK_MS.
 */
export class LipStabilityEngine {
  private smoother = new StabilitySmoothingSystem(5);
  private prev: LipGeometry | null = null;
  private holdStart: number | null = null;
  private holdDuration = 0;
  private pausedHoldMs = 0;
  private breakStart: number | null = null;
  private unstableFrames = 0;
  private microBreaks = 0;

  reset() {
    this.smoother.reset();
    this.prev = null;
    this.holdStart = null;
    this.holdDuration = 0;
    this.pausedHoldMs = 0;
    this.breakStart = null;
    this.unstableFrames = 0;
    this.microBreaks = 0;
  }

  getMicroBreaks() {
    return this.microBreaks;
  }

  processGeometry(geo: LipGeometry | null, now = Date.now()): LipStabilitySnapshot {
    if (!geo) {
      this.unstableFrames += 1;
      return this.snapshot(now, 99, true, false);
    }

    this.unstableFrames = Math.max(0, this.unstableFrames - 1);

    let rawMovement = 0;
    if (this.prev) {
      rawMovement =
        Math.abs(geo.mouthWidth - this.prev.mouthWidth) +
        Math.abs(geo.mouthHeight - this.prev.mouthHeight);
    }
    this.prev = geo;

    const { smoothedMovement, stableHold } = this.smoother.push(rawMovement);
    const inGracePeriod = this.updateHold(stableHold, now);

    const stabilityScore = Math.min(1, Math.max(0, 1 - smoothedMovement / 12));
    const confidence = Math.min(1, Math.max(0.35, 1 - this.unstableFrames / 20));

    return {
      stableHold: stableHold || inGracePeriod,
      stabilityScore,
      holdDuration: this.holdDuration,
      confidence,
      smoothedMovement,
      unstable: this.unstableFrames > 8,
      inGracePeriod,
    };
  }

  /** Native fallback — single scalar movement proxy (ratio delta × 1000). */
  processMovementDelta(rawDelta: number, now = Date.now()): LipStabilitySnapshot {
    if (!Number.isFinite(rawDelta)) {
      this.unstableFrames += 1;
      return this.snapshot(now, 99, true, false);
    }
    this.unstableFrames = Math.max(0, this.unstableFrames - 1);
    const { smoothedMovement, stableHold } = this.smoother.push(rawDelta);
    const inGracePeriod = this.updateHold(stableHold, now);
    const stabilityScore = Math.min(1, Math.max(0, 1 - smoothedMovement / 12));
    const confidence = Math.min(1, Math.max(0.35, 1 - this.unstableFrames / 20));
    return {
      stableHold: stableHold || inGracePeriod,
      stabilityScore,
      holdDuration: this.holdDuration,
      confidence,
      smoothedMovement,
      unstable: this.unstableFrames > 8,
      inGracePeriod,
    };
  }

  private updateHold(stableHold: boolean, now: number): boolean {
    if (stableHold) {
      if (this.breakStart != null) {
        const breakLen = now - this.breakStart;
        if (breakLen <= ALLOWED_BREAK_MS) {
          this.breakStart = null;
          if (this.holdStart == null) {
            this.holdStart = now - this.pausedHoldMs;
          }
          this.holdDuration = now - this.holdStart;
          return true;
        }
        this.microBreaks += 1;
      }
      this.breakStart = null;
      if (this.holdStart == null) this.holdStart = now;
      this.holdDuration = now - this.holdStart;
      this.pausedHoldMs = this.holdDuration;
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
    now: number,
    smoothedMovement: number,
    unstable: boolean,
    inGracePeriod: boolean,
  ): LipStabilitySnapshot {
    return {
      stableHold: this.smoother.stable || inGracePeriod,
      stabilityScore: Math.max(0, 1 - smoothedMovement / 12),
      holdDuration: this.holdDuration,
      confidence: Math.max(0, 1 - this.unstableFrames / 15),
      smoothedMovement,
      unstable,
      inGracePeriod,
    };
  }
}
