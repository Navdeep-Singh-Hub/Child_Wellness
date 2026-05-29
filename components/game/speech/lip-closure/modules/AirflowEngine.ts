import type { AirflowSample } from './lipAirflowTypes';

const WINDOW = 6;
const CAL_SAMPLES = 18;
const SHOUT_LEVEL = 0.52;
const SHOUT_DELTA = 0.22;

/**
 * Approximates gentle sustained airflow from mic envelope — not true airflow sensing.
 * Ignores sharp shout spikes; rewards soft continuous noise.
 */
export class AirflowEngine {
  private smooth = 0;
  private noiseFloor = 0.06;
  private calibrated = false;
  private calSamples: number[] = [];
  private levelBuf: number[] = [];
  private sustainStart: number | null = null;

  reset() {
    this.smooth = 0;
    this.noiseFloor = 0.06;
    this.calibrated = false;
    this.calSamples.length = 0;
    this.levelBuf.length = 0;
    this.sustainStart = null;
  }

  private calibrate(level: number) {
    this.calSamples.push(level);
    if (this.calSamples.length >= CAL_SAMPLES) {
      const sorted = [...this.calSamples].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)] ?? 0.06;
      this.noiseFloor = Math.min(0.22, median + 0.05);
      this.calibrated = true;
      this.calSamples.length = 0;
    }
  }

  push(level: number, now = Date.now()): AirflowSample {
    if (!this.calibrated) this.calibrate(level);

    const prev = this.smooth;
    this.smooth = this.smooth * 0.68 + level * 0.32;
    const delta = Math.abs(level - prev);

    this.levelBuf.push(level);
    if (this.levelBuf.length > WINDOW) this.levelBuf.shift();

    const softMin = this.noiseFloor + 0.07;
    const softMax = 0.48;
    const isShout = level >= SHOUT_LEVEL || delta > SHOUT_DELTA;

    let airflowStrength = 0;
    if (level > softMin && !isShout) {
      airflowStrength = Math.min(1, (level - softMin) / (softMax - softMin));
    } else if (isShout) {
      airflowStrength = Math.max(0, airflowStrength * 0.25);
    }

    const mean = this.levelBuf.reduce((a, b) => a + b, 0) / Math.max(1, this.levelBuf.length);
    const variance =
      this.levelBuf.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, this.levelBuf.length);
    const airflowStability = Math.max(0, Math.min(1, 1 - variance * 12));

    const airflowActive = airflowStrength > 0.1 && airflowStability > 0.25 && !isShout;

    if (airflowActive) {
      if (this.sustainStart == null) this.sustainStart = now;
    } else {
      this.sustainStart = null;
    }

    const airflowDuration = this.sustainStart != null ? now - this.sustainStart : 0;

    return {
      airflowStrength,
      airflowStability,
      airflowDuration,
      airflowActive,
      isShout,
    };
  }
}
