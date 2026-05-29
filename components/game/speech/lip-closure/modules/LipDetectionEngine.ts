import { DetectionSmoothingSystem } from './DetectionSmoothingSystem';
import type { LipDetectionSnapshot } from './types';

/** MediaPipe inner lip centers: upper 13, lower 17 */
export const UPPER_LIP_INDEX = 13;
export const LOWER_LIP_INDEX = 17;

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Processes only upper/lower lip center landmarks.
 * gap scaled ×1000 for threshold comparison (7 closed / 10 open).
 */
export class LipDetectionEngine {
  private smoother = new DetectionSmoothingSystem(5);
  private holdStart: number | null = null;
  private holdDuration = 0;
  private unstableFrames = 0;

  reset() {
    this.smoother.reset();
    this.holdStart = null;
    this.holdDuration = 0;
    this.unstableFrames = 0;
  }

  /** From normalized landmark pair */
  processLandmarks(
    upper: { x: number; y: number } | null | undefined,
    lower: { x: number; y: number } | null | undefined,
    now = Date.now(),
  ): LipDetectionSnapshot {
    if (!upper || !lower) {
      this.unstableFrames += 1;
      return {
        lipsClosed: this.smoother.closed,
        holdDuration: this.holdDuration,
        confidence: Math.max(0, 1 - this.unstableFrames / 15),
        smoothedGap: 99,
        unstable: true,
      };
    }

    this.unstableFrames = Math.max(0, this.unstableFrames - 1);
    const rawGap = dist(upper, lower) * 1000;
    const { smoothedGap, lipsClosed } = this.smoother.push(rawGap);

    if (lipsClosed) {
      if (this.holdStart == null) this.holdStart = now;
      this.holdDuration = now - this.holdStart;
    } else {
      this.holdStart = null;
      this.holdDuration = 0;
    }

    const confidence = Math.min(1, Math.max(0.35, 1 - this.unstableFrames / 20));

    return {
      lipsClosed,
      holdDuration: this.holdDuration,
      confidence,
      smoothedGap,
      unstable: this.unstableFrames > 8,
    };
  }

  /** Native/web ratio fallback — gap = ratio × 1000 */
  processGap(rawGap: number, now = Date.now()): LipDetectionSnapshot {
    if (!Number.isFinite(rawGap)) {
      this.unstableFrames += 1;
      return {
        lipsClosed: this.smoother.closed,
        holdDuration: this.holdDuration,
        confidence: 0.3,
        smoothedGap: 99,
        unstable: true,
      };
    }
    this.unstableFrames = Math.max(0, this.unstableFrames - 1);
    const { smoothedGap, lipsClosed } = this.smoother.push(rawGap);

    if (lipsClosed) {
      if (this.holdStart == null) this.holdStart = now;
      this.holdDuration = now - this.holdStart;
    } else {
      this.holdStart = null;
      this.holdDuration = 0;
    }

    return {
      lipsClosed,
      holdDuration: this.holdDuration,
      confidence: Math.min(1, Math.max(0.35, 1 - this.unstableFrames / 20)),
      smoothedGap,
      unstable: this.unstableFrames > 8,
    };
  }
}
