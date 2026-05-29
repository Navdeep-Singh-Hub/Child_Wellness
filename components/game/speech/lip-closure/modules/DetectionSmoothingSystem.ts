/** Moving average + hysteresis for lip gap (last N frames). */

const DEFAULT_WINDOW = 5;
const CLOSE_THRESHOLD = 7;
const OPEN_THRESHOLD = 10;

export class DetectionSmoothingSystem {
  private readonly window: number;
  private readonly buffer: number[] = [];
  private lipsClosed = false;

  constructor(windowSize = DEFAULT_WINDOW) {
    this.window = windowSize;
  }

  reset() {
    this.buffer.length = 0;
    this.lipsClosed = false;
  }

  push(rawGap: number): { smoothedGap: number; lipsClosed: boolean } {
    this.buffer.push(rawGap);
    if (this.buffer.length > this.window) {
      this.buffer.shift();
    }
    const smoothedGap =
      this.buffer.reduce((a, b) => a + b, 0) / Math.max(1, this.buffer.length);

    if (smoothedGap < CLOSE_THRESHOLD) {
      this.lipsClosed = true;
    } else if (smoothedGap > OPEN_THRESHOLD) {
      this.lipsClosed = false;
    }

    return { smoothedGap, lipsClosed: this.lipsClosed };
  }

  get closed() {
    return this.lipsClosed;
  }
}

export { CLOSE_THRESHOLD, OPEN_THRESHOLD };
