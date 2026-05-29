/** Moving average + hysteresis for lip roundness ratio (last N frames). */

const DEFAULT_WINDOW = 5;
export const ROUNDED_THRESHOLD = 0.55;
export const SPREAD_THRESHOLD = 0.35;

export class RoundnessSmoothingSystem {
  private readonly window: number;
  private readonly buffer: number[] = [];
  private roundedLips = false;

  constructor(windowSize = DEFAULT_WINDOW) {
    this.window = windowSize;
  }

  reset() {
    this.buffer.length = 0;
    this.roundedLips = false;
  }

  push(rawRatio: number): { smoothedRatio: number; roundedLips: boolean } {
    this.buffer.push(rawRatio);
    if (this.buffer.length > this.window) {
      this.buffer.shift();
    }
    const smoothedRatio =
      this.buffer.reduce((a, b) => a + b, 0) / Math.max(1, this.buffer.length);

    if (smoothedRatio > ROUNDED_THRESHOLD) {
      this.roundedLips = true;
    } else if (smoothedRatio < SPREAD_THRESHOLD) {
      this.roundedLips = false;
    }

    return { smoothedRatio, roundedLips: this.roundedLips };
  }

  get rounded() {
    return this.roundedLips;
  }
}
