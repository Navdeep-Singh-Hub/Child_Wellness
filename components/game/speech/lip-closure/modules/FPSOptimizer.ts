/** Throttle detection callbacks to ~25 FPS max. */

export class FPSOptimizer {
  private last = 0;
  private readonly minIntervalMs: number;

  constructor(targetFps = 25) {
    this.minIntervalMs = 1000 / targetFps;
  }

  shouldProcess(now = performance.now()) {
    if (now - this.last < this.minIntervalMs) return false;
    this.last = now;
    return true;
  }

  reset() {
    this.last = 0;
  }
}
