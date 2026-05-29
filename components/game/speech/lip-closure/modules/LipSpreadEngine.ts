import { NEUTRAL_THRESHOLD, SpreadSmoothingSystem, SPREAD_THRESHOLD } from './SpreadSmoothingSystem';
import type { LipSpreadSnapshot } from './lipSpreadTypes';

export const UPPER_LIP_INDEX = 13;
export const LOWER_LIP_INDEX = 17;
export const LEFT_LIP_CORNER_INDEX = 61;
export const RIGHT_LIP_CORNER_INDEX = 291;

export const ALLOWED_BREAK_MS = 400;
export const CONFIRM_SPREAD_MS = 650;

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function spreadFromLandmarks(
  upper: { x: number; y: number } | null | undefined,
  lower: { x: number; y: number } | null | undefined,
  left: { x: number; y: number } | null | undefined,
  right: { x: number; y: number } | null | undefined,
): number | null {
  if (!upper || !lower || !left || !right) return null;
  const mouthWidth = dist(left, right);
  const mouthHeight = dist(upper, lower);
  if (mouthHeight < 0.001) return null;
  return mouthWidth / mouthHeight;
}

/**
 * Detects intentional lip spreading (EEE / smile) via width/height ratio.
 * Brief breaks up to ALLOWED_BREAK_MS do not reset progress harshly.
 */
export class LipSpreadEngine {
  private smoother = new SpreadSmoothingSystem(5);
  private holdStart: number | null = null;
  private holdDuration = 0;
  private pausedHoldMs = 0;
  private breakStart: number | null = null;
  private spreadSince: number | null = null;
  private unstableFrames = 0;
  private microBreaks = 0;

  reset() {
    this.smoother.reset();
    this.holdStart = null;
    this.holdDuration = 0;
    this.pausedHoldMs = 0;
    this.breakStart = null;
    this.spreadSince = null;
    this.unstableFrames = 0;
    this.microBreaks = 0;
  }

  getMicroBreaks() {
    return this.microBreaks;
  }

  processSpread(rawSpread: number | null, now = Date.now()): LipSpreadSnapshot {
    if (rawSpread == null || !Number.isFinite(rawSpread)) {
      this.unstableFrames += 1;
      return this.snapshot(0, true, false, false);
    }

    this.unstableFrames = Math.max(0, this.unstableFrames - 1);
    const { smoothedSpread, lipsSpread } = this.smoother.push(rawSpread);
    const inGracePeriod = this.updateHold(lipsSpread, now);
    const confirmedSpread = this.isConfirmed(now, lipsSpread || inGracePeriod);
    const spreadScore = Math.min(
      1,
      Math.max(0, (smoothedSpread - NEUTRAL_THRESHOLD) / (SPREAD_THRESHOLD - NEUTRAL_THRESHOLD)),
    );
    const confidence = Math.min(1, Math.max(0.35, 1 - this.unstableFrames / 20));

    return {
      lipsSpread: lipsSpread || inGracePeriod,
      confirmedSpread,
      spreadScore,
      smoothedSpread,
      holdDuration: this.holdDuration,
      confidence,
      unstable: this.unstableFrames > 8,
      inGracePeriod,
    };
  }

  private isConfirmed(now: number, effectivelySpread: boolean): boolean {
    if (!effectivelySpread) {
      if (this.spreadSince != null && now - this.spreadSince >= CONFIRM_SPREAD_MS) {
        return this.holdDuration > 0 || this.pausedHoldMs > 0;
      }
      return false;
    }
    if (this.spreadSince == null) this.spreadSince = now;
    return now - this.spreadSince >= CONFIRM_SPREAD_MS;
  }

  private updateHold(lipsSpread: boolean, now: number): boolean {
    if (lipsSpread) {
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
      if (this.spreadSince == null) this.spreadSince = now;
      const confirmed = now - this.spreadSince >= CONFIRM_SPREAD_MS;
      if (confirmed) {
        if (this.holdStart == null) this.holdStart = now - this.pausedHoldMs;
        this.holdDuration = now - this.holdStart;
        this.pausedHoldMs = this.holdDuration;
      }
      return false;
    }

    if (this.spreadSince != null && this.breakStart == null) {
      this.breakStart = now;
      this.pausedHoldMs = this.holdDuration;
    }
    if (this.breakStart != null && now - this.breakStart > ALLOWED_BREAK_MS) {
      this.holdStart = null;
      this.holdDuration = 0;
      this.pausedHoldMs = 0;
      this.spreadSince = null;
    } else if (this.breakStart == null) {
      this.spreadSince = null;
    }
    return this.breakStart != null && now - this.breakStart <= ALLOWED_BREAK_MS;
  }

  private snapshot(
    smoothedSpread: number,
    unstable: boolean,
    inGracePeriod: boolean,
    confirmedSpread: boolean,
  ): LipSpreadSnapshot {
    return {
      lipsSpread: this.smoother.spread || inGracePeriod,
      confirmedSpread,
      spreadScore: Math.min(1, Math.max(0, smoothedSpread / SPREAD_THRESHOLD)),
      smoothedSpread,
      holdDuration: this.holdDuration,
      confidence: Math.max(0, 1 - this.unstableFrames / 15),
      unstable,
      inGracePeriod,
    };
  }
}
