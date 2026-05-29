import type {
  BreathActivationDifficulty,
  BreathActivationSnapshot,
  BreathActivationState,
} from './breathActivationTypes';

const WINDOW = 5;
const CALIBRATION_SAMPLES = 28;
const MIN_ACTIVE_MS = 280;

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function avg(nums: number[]) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/** Mic amplitude → start/stop breath activation. High tolerance; prefers success. */
export class BreathActivationEngine {
  private state: BreathActivationState = 'IDLE';
  private difficulty: BreathActivationDifficulty = 'easy';
  private buffer: number[] = [];
  private calibration: number[] = [];
  private calibrated = false;
  private baseline = 0.04;
  private threshold = 0.12;
  private smoothed = 0;
  private isActive = false;
  private breathStart: number | null = null;
  private breathAttempts = 0;
  private durationSum = 0;
  private sessionStart = Date.now();
  private lastStopIntensity = 0;

  private edgeStarted = false;
  private pendingCycle = false;

  configure(difficulty: BreathActivationDifficulty) {
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
    this.isActive = false;
    this.breathStart = null;
    this.breathAttempts = 0;
    this.durationSum = 0;
    this.sessionStart = Date.now();
    this.edgeStarted = false;
    this.pendingCycle = false;
    this.applyThreshold();
  }

  private applyThreshold() {
    const margin =
      this.difficulty === 'easy' ? 0.055 : this.difficulty === 'hard' ? 0.13 : 0.085;
    this.threshold = this.baseline + margin;
  }

  lowerDifficulty() {
    this.baseline = Math.max(0.02, this.baseline * 0.9);
    this.applyThreshold();
  }

  simulateStartStop(intensity = 0.45) {
    this.calibrated = true;
    this.smoothed = intensity;
    this.buffer = [intensity, intensity * 0.92, intensity * 0.88, intensity * 0.85, intensity * 0.8];
    this.isActive = false;
    this.breathStart = null;
    this.lastStopIntensity = intensity;
    this.breathAttempts += 1;
    this.durationSum += 400;
    this.pendingCycle = true;
    this.state = 'BREATH_STOPPED';
  }

  private registerStop(now: number, duration: number, intensity: number) {
    this.isActive = false;
    this.breathStart = null;
    this.pendingCycle = true;
    this.lastStopIntensity = intensity;
    this.breathAttempts += 1;
    this.durationSum += duration;
    this.state = 'BREATH_STOPPED';
  }

  process(rawLevel: number, now = Date.now()): BreathActivationSnapshot {
    if (this.state === 'PAUSED') {
      return this.buildSnapshot(now);
    }
    if (this.state === 'IDLE') {
      this.state = 'LISTENING';
    }

    const level = clamp01(rawLevel);
    this.edgeStarted = false;

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
        ...this.buildSnapshot(now),
        smoothedLevel: level,
        calibrated: false,
      };
    }

    this.buffer.push(level);
    if (this.buffer.length > WINDOW) this.buffer.shift();
    this.smoothed = avg(this.buffer);

    const generous = this.difficulty === 'easy' ? 0.028 : 0.045;
    const active =
      this.smoothed > this.threshold ||
      this.smoothed > this.baseline + generous ||
      level > this.threshold * 0.88;

    if (active && !this.isActive) {
      this.isActive = true;
      this.breathStart = now;
      this.edgeStarted = true;
      this.state = 'BREATH_ACTIVE';
    } else if (!active && this.isActive) {
      const duration = this.breathStart != null ? now - this.breathStart : 0;
      if (duration >= MIN_ACTIVE_MS) {
        this.registerStop(now, duration, clamp01((this.smoothed - this.baseline) / 0.35));
      } else {
        this.isActive = false;
        this.breathStart = null;
        this.state = 'LISTENING';
      }
    } else if (active) {
      this.state = 'BREATH_ACTIVE';
    } else if (this.state === 'BREATH_STOPPED') {
      this.state = 'LISTENING';
    } else if (this.state !== 'HELPING') {
      this.state = 'LISTENING';
    }

    return this.buildSnapshot(now);
  }

  private buildSnapshot(now: number): BreathActivationSnapshot {
    const duration = this.breathStart != null ? now - this.breathStart : 0;
    const intensity = clamp01((this.smoothed - this.baseline) / 0.35);

    return {
      breathActive: this.isActive,
      breathStopped: this.pendingCycle,
      breathStarted: this.edgeStarted,
      cyclePulse: this.pendingCycle,
      intensity: this.isActive ? intensity : this.lastStopIntensity,
      duration,
      confidence: this.isActive ? 0.78 + intensity * 0.22 : 0.3,
      state: this.state,
      smoothedLevel: this.smoothed,
      calibrated: this.calibrated,
    };
  }

  consumeCyclePulse(): boolean {
    if (!this.pendingCycle) return false;
    this.pendingCycle = false;
    if (this.state === 'BREATH_STOPPED') this.state = 'LISTENING';
    return true;
  }

  getAnalytics() {
    const n = Math.max(1, this.breathAttempts);
    return {
      breathAttempts: this.breathAttempts,
      engagementTimeMs: Date.now() - this.sessionStart,
      interactionSuccess: this.breathAttempts,
      averageDuration: this.durationSum / n,
      lastUpdated: Date.now(),
    };
  }
}
