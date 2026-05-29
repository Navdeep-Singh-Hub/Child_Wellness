import { RoundnessSmoothingSystem, ROUNDED_THRESHOLD, SPREAD_THRESHOLD } from './RoundnessSmoothingSystem';
import type { LipRoundSnapshot } from './lipRoundTypes';

export const UPPER_LIP_INDEX = 13;
export const LOWER_LIP_INDEX = 17;
export const LEFT_LIP_CORNER_INDEX = 61;
export const RIGHT_LIP_CORNER_INDEX = 291;

export const ALLOWED_BREAK_MS = 400;
/** Rounded O must hold ~500–800 ms before qualifying hold counts. */
export const CONFIRM_ROUND_MS = 650;

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function roundnessFromLandmarks(
  upper: { x: number; y: number } | null | undefined,
  lower: { x: number; y: number } | null | undefined,
  left: { x: number; y: number } | null | undefined,
  right: { x: number; y: number } | null | undefined,
): number | null {
  if (!upper || !lower || !left || !right) return null;
  const mouthWidth = dist(left, right);
  const mouthHeight = dist(upper, lower);
  if (mouthWidth < 0.001) return null;
  return mouthHeight / mouthWidth;
}

/**
 * Detects intentional O-shaped lip rounding via height/width ratio.
 * Brief breaks up to ALLOWED_BREAK_MS do not reset progress harshly.
 */
export class LipRoundnessEngine {
  private smoother = new RoundnessSmoothingSystem(5);
  private holdStart: number | null = null;
  private holdDuration = 0;
  private pausedHoldMs = 0;
  private breakStart: number | null = null;
  private roundedSince: number | null = null;
  private unstableFrames = 0;
  private microBreaks = 0;

  reset() {
    this.smoother.reset();
    this.holdStart = null;
    this.holdDuration = 0;
    this.pausedHoldMs = 0;
    this.breakStart = null;
    this.roundedSince = null;
    this.unstableFrames = 0;
    this.microBreaks = 0;
  }

  getMicroBreaks() {
    return this.microBreaks;
  }

  processRatio(rawRatio: number | null, now = Date.now()): LipRoundSnapshot {
    if (rawRatio == null || !Number.isFinite(rawRatio)) {
      this.unstableFrames += 1;
      return this.snapshot(now, 0, true, false, false);
    }

    this.unstableFrames = Math.max(0, this.unstableFrames - 1);
    const { smoothedRatio, roundedLips } = this.smoother.push(rawRatio);
    const inGracePeriod = this.updateHold(roundedLips, now);
    const confirmedRounded = this.isConfirmed(now, roundedLips || inGracePeriod);
    const roundnessScore = Math.min(
      1,
      Math.max(0, (smoothedRatio - SPREAD_THRESHOLD) / (ROUNDED_THRESHOLD - SPREAD_THRESHOLD)),
    );
    const confidence = Math.min(1, Math.max(0.35, 1 - this.unstableFrames / 20));

    return {
      roundedLips: roundedLips || inGracePeriod,
      confirmedRounded,
      roundnessScore,
      smoothedRatio,
      holdDuration: this.holdDuration,
      confidence,
      unstable: this.unstableFrames > 8,
      inGracePeriod,
    };
  }

  private isConfirmed(now: number, effectivelyRounded: boolean): boolean {
    if (!effectivelyRounded) {
      if (this.roundedSince != null && now - this.roundedSince >= CONFIRM_ROUND_MS) {
        return this.holdDuration > 0 || this.pausedHoldMs > 0;
      }
      return false;
    }
    if (this.roundedSince == null) this.roundedSince = now;
    return now - this.roundedSince >= CONFIRM_ROUND_MS;
  }

  private updateHold(roundedLips: boolean, now: number): boolean {
    if (roundedLips) {
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
      if (this.roundedSince == null) this.roundedSince = now;
      const confirmed = now - this.roundedSince >= CONFIRM_ROUND_MS;
      if (confirmed) {
        if (this.holdStart == null) this.holdStart = now - this.pausedHoldMs;
        this.holdDuration = now - this.holdStart;
        this.pausedHoldMs = this.holdDuration;
      }
      return false;
    }

    if (this.roundedSince != null && this.breakStart == null) {
      this.breakStart = now;
      this.pausedHoldMs = this.holdDuration;
    }
    if (this.breakStart != null && now - this.breakStart > ALLOWED_BREAK_MS) {
      this.holdStart = null;
      this.holdDuration = 0;
      this.pausedHoldMs = 0;
      this.roundedSince = null;
    } else if (this.breakStart == null) {
      this.roundedSince = null;
    }
    return this.breakStart != null && now - this.breakStart <= ALLOWED_BREAK_MS;
  }

  private snapshot(
    _now: number,
    smoothedRatio: number,
    unstable: boolean,
    inGracePeriod: boolean,
    confirmedRounded: boolean,
  ): LipRoundSnapshot {
    return {
      roundedLips: this.smoother.rounded || inGracePeriod,
      confirmedRounded,
      roundnessScore: Math.min(1, Math.max(0, smoothedRatio)),
      smoothedRatio,
      holdDuration: this.holdDuration,
      confidence: Math.max(0, 1 - this.unstableFrames / 15),
      unstable,
      inGracePeriod,
    };
  }
}
