import type { BreathDifficulty, BreathGameState, BreathSnapshot } from './breathAwarenessTypes';

const WINDOW = 5;
const CALIBRATION_SAMPLES = 14;

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function avg(nums: number[]) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/** Mic amplitude → gentle breath awareness. High tolerance; prefers success. */
export class BreathAwarenessEngine {
  private state: BreathGameState = 'IDLE';
  private difficulty: BreathDifficulty = 'easy';
  private buffer: number[] = [];
  private calibration: number[] = [];
  private calibrated = false;
  private baseline = 0.04;
  private threshold = 0.12;
  private smoothed = 0;
  private wasBreathing = false;
  private breathStart: number | null = null;
  private breathAttempts = 0;
  private intensitySum = 0;
  private sessionStart = Date.now();

  configure(difficulty: BreathDifficulty) {
    this.difficulty = difficulty;
    this.applyThreshold();
  }

  reset() {
    this.state = 'IDLE';
    this.buffer = [];
    this.calibration = [];
    this.calibrated = false;
    this.baseline = 0.04;
    this.threshold = 0.12;
    this.smoothed = 0;
    this.wasBreathing = false;
    this.breathStart = null;
    this.breathAttempts = 0;
    this.intensitySum = 0;
    this.sessionStart = Date.now();
    this.applyThreshold();
  }

  private applyThreshold() {
    const margin =
      this.difficulty === 'easy' ? 0.04 : this.difficulty === 'hard' ? 0.12 : 0.07;
    this.threshold = this.baseline + margin;
  }

  /** Manual / accessibility — counts as a soft breath attempt */
  simulateBreath(intensity = 0.38) {
    this.calibrated = true;
    this.buffer = [intensity, intensity * 0.95, intensity * 0.9, intensity * 0.88, intensity * 0.85];
    this.smoothed = intensity;
    this.registerBreathAttempt(intensity, Date.now());
    this.state = 'REWARDING';
  }

  private registerBreathAttempt(intensity: number, now: number) {
    this.breathAttempts += 1;
    this.intensitySum += intensity;
    this.breathStart = now;
  }

  lowerDifficulty() {
    this.baseline = Math.max(0.02, this.baseline * 0.92);
    this.applyThreshold();
  }

  process(rawLevel: number, now = Date.now()): BreathSnapshot {
    if (this.state === 'PAUSED') {
      return this.snapshot(false, now);
    }
    if (this.state === 'IDLE') {
      this.state = 'LISTENING';
    }

    const level = clamp01(rawLevel);

    if (!this.calibrated) {
      this.calibration.push(level);
      if (this.calibration.length >= CALIBRATION_SAMPLES) {
        const sorted = [...this.calibration].sort((a, b) => a - b);
        const mid = sorted[Math.floor(sorted.length / 2)] ?? 0.05;
        this.baseline = clamp01(mid * 0.85 + 0.02);
        this.calibrated = true;
        this.applyThreshold();
      }
      return {
        ...this.snapshot(false, now),
        smoothedLevel: level,
        calibrated: false,
      };
    }

    this.buffer.push(level);
    if (this.buffer.length > WINDOW) this.buffer.shift();
    this.smoothed = avg(this.buffer);

    const generousMargin = this.difficulty === 'easy' ? 0.03 : 0.05;
    const isBreathing =
      this.smoothed > this.threshold ||
      this.smoothed > this.baseline + generousMargin ||
      level > this.threshold * 0.9;

    let breathPulse = false;

    if (isBreathing) {
      if (!this.wasBreathing) {
        breathPulse = true;
        this.registerBreathAttempt(this.smoothed, now);
        this.state = 'BREATH_DETECTED';
      }
      if (!this.breathStart) this.breathStart = now;
    } else if (this.wasBreathing) {
      if (this.state === 'BREATH_DETECTED') {
        this.state = 'REWARDING';
      }
      this.breathStart = null;
    }

    this.wasBreathing = isBreathing;

    if (this.state === 'REWARDING' && !breathPulse) {
      this.state = 'LISTENING';
    }

    return {
      ...this.snapshot(breathPulse, now),
      breathPulse,
      breathDetected: isBreathing,
      intensity: clamp01((this.smoothed - this.baseline) / 0.35),
      duration: this.breathStart != null ? now - this.breathStart : 0,
      confidence: isBreathing ? 0.75 + this.smoothed * 0.25 : 0.2,
      smoothedLevel: this.smoothed,
      calibrated: true,
    };
  }

  private snapshot(breathPulse: boolean, now: number): BreathSnapshot {
    return {
      breathDetected: this.wasBreathing,
      breathPulse,
      intensity: clamp01((this.smoothed - this.baseline) / 0.35),
      duration: this.breathStart != null ? now - this.breathStart : 0,
      confidence: this.wasBreathing ? 0.8 : 0.25,
      state: this.state,
      smoothedLevel: this.smoothed,
      calibrated: this.calibrated,
    };
  }

  consumeBreathPulse(): boolean {
    if (this.state !== 'BREATH_DETECTED' && this.state !== 'REWARDING') return false;
    this.state = 'LISTENING';
    this.breathStart = null;
    return true;
  }

  getAnalytics() {
    const attempts = Math.max(1, this.breathAttempts);
    return {
      breathAttempts: this.breathAttempts,
      engagementTimeMs: Date.now() - this.sessionStart,
      interactionSuccess: this.breathAttempts,
      averageIntensity: this.intensitySum / attempts,
      lastUpdated: Date.now(),
    };
  }
}
