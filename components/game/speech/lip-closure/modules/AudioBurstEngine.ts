/** Microphone loudness only — burst detection with adaptive noise floor. */

const WINDOW = 5;
const DEFAULT_COOLDOWN_MS = 400;

export class AudioBurstEngine {
  private buffer: number[] = [];
  private smooth = 0;
  private noiseFloor = 0.06;
  private calibrated = false;
  private calSamples: number[] = [];
  private lastBurstAt = 0;
  private readonly cooldownMs: number;

  constructor(cooldownMs = DEFAULT_COOLDOWN_MS) {
    this.cooldownMs = cooldownMs;
  }

  reset() {
    this.buffer.length = 0;
    this.smooth = 0;
    this.noiseFloor = 0.06;
    this.calibrated = false;
    this.calSamples.length = 0;
    this.lastBurstAt = 0;
  }

  /** Collect ~1s of samples for noise floor calibration. */
  calibrate(level: number) {
    this.calSamples.push(level);
    if (this.calSamples.length >= 20) {
      const sorted = [...this.calSamples].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)] ?? 0.06;
      this.noiseFloor = Math.min(0.25, median + 0.04);
      this.calibrated = true;
      this.calSamples.length = 0;
    }
  }

  push(level: number, now = Date.now()): { audioLevel: number; audioSpike: boolean } {
    if (!this.calibrated) {
      this.calibrate(level);
    }

    this.buffer.push(level);
    if (this.buffer.length > WINDOW) this.buffer.shift();
    const audioLevel = this.buffer.reduce((a, b) => a + b, 0) / Math.max(1, this.buffer.length);

    const prev = this.smooth;
    this.smooth = this.smooth * 0.6 + audioLevel * 0.4;
    const delta = audioLevel - prev;
    const threshold = this.noiseFloor + 0.1;
    const spikeRaw = audioLevel > threshold && delta > 0.06;

    let audioSpike = false;
    if (spikeRaw && now - this.lastBurstAt > this.cooldownMs) {
      audioSpike = true;
      this.lastBurstAt = now;
    }

    return { audioLevel, audioSpike };
  }

  getThreshold() {
    return this.noiseFloor + 0.1;
  }
}
