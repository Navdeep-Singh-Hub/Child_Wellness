/** Moving average + hysteresis for lip spread ratio (last N frames). */

const DEFAULT_WINDOW = 5;
export const SPREAD_THRESHOLD = 3.5;
export const NEUTRAL_THRESHOLD = 2.0;

export class SpreadSmoothingSystem {
  private readonly window: number;
  private readonly buffer: number[] = [];
  private lipsSpread = false;

  constructor(windowSize = DEFAULT_WINDOW) {
    this.window = windowSize;
  }

  reset() {
    this.buffer.length = 0;
    this.lipsSpread = false;
  }

  push(rawSpread: number): { smoothedSpread: number; lipsSpread: boolean } {
    this.buffer.push(rawSpread);
    if (this.buffer.length > this.window) {
      this.buffer.shift();
    }
    const smoothedSpread =
      this.buffer.reduce((a, b) => a + b, 0) / Math.max(1, this.buffer.length);

    if (smoothedSpread > SPREAD_THRESHOLD) {
      this.lipsSpread = true;
    } else if (smoothedSpread < NEUTRAL_THRESHOLD) {
      this.lipsSpread = false;
    }

    return { smoothedSpread, lipsSpread: this.lipsSpread };
  }

  get spread() {
    return this.lipsSpread;
  }
}
