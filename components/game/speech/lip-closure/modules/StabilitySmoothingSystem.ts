/** Moving average + hysteresis for lip micro-movement (last N frames). */

const DEFAULT_WINDOW = 5;
export const STABLE_THRESHOLD = 3;
export const UNSTABLE_THRESHOLD = 5;

export class StabilitySmoothingSystem {
  private readonly window: number;
  private readonly buffer: number[] = [];
  private stableHold = true;

  constructor(windowSize = DEFAULT_WINDOW) {
    this.window = windowSize;
  }

  reset() {
    this.buffer.length = 0;
    this.stableHold = true;
  }

  push(rawMovement: number): { smoothedMovement: number; stableHold: boolean } {
    this.buffer.push(rawMovement);
    if (this.buffer.length > this.window) {
      this.buffer.shift();
    }
    const smoothedMovement =
      this.buffer.reduce((a, b) => a + b, 0) / Math.max(1, this.buffer.length);

    if (smoothedMovement < STABLE_THRESHOLD) {
      this.stableHold = true;
    } else if (smoothedMovement > UNSTABLE_THRESHOLD) {
      this.stableHold = false;
    }

    return { smoothedMovement, stableHold: this.stableHold };
  }

  get stable() {
    return this.stableHold;
  }
}
