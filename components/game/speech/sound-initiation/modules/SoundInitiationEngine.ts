import type {
  SoundInitiationAnalytics,
  SoundInitiationDifficulty,
  SoundInitiationSnapshot,
  SoundInitiationState,
} from './soundInitiationTypes';

const WINDOW = 5;
const CALIBRATION_SAMPLES = 14;
const IDLE_HELPER_MS = 8000;

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function avg(nums: number[]) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/**
 * Mic amplitude only — no speech content analysis.
 * Rewards any vocal attempt (hum, squeak, ahh, whisper, etc.).
 */
export class SoundInitiationEngine {
  private state: SoundInitiationState = 'IDLE';
  private difficulty: SoundInitiationDifficulty = 'easy';
  private buffer: number[] = [];
  private calibration: number[] = [];
  private calibrated = false;
  private baseline = 0.05;
  private threshold = 0.14;
  private smoothed = 0;
  private wasSounding = false;
  private soundStart: number | null = null;
  private soundAttempts = 0;
  private intensitySum = 0;
  private durationSum = 0;
  private sessionStart = Date.now();
  private lastSoundMs = Date.now();
  private helperShown = false;

  configure(difficulty: SoundInitiationDifficulty) {
    this.difficulty = difficulty;
    this.applyThreshold();
  }

  reset() {
    this.state = 'IDLE';
    this.buffer = [];
    this.calibration = [];
    this.calibrated = false;
    this.baseline = 0.05;
    this.threshold = 0.14;
    this.smoothed = 0;
    this.wasSounding = false;
    this.soundStart = null;
    this.soundAttempts = 0;
    this.intensitySum = 0;
    this.durationSum = 0;
    this.sessionStart = Date.now();
    this.lastSoundMs = Date.now();
    this.helperShown = false;
    this.applyThreshold();
  }

  private applyThreshold() {
    const margin =
      this.difficulty === 'easy' ? 0.035 : this.difficulty === 'hard' ? 0.1 : 0.055;
    this.threshold = this.baseline + margin;
  }

  /** Tap / Good try — counts as vocal attempt without mic */
  simulateSound(intensity = 0.45) {
    this.calibrated = true;
    this.buffer = [intensity, intensity * 0.96, intensity * 0.92, intensity * 0.9, intensity * 0.88];
    this.smoothed = intensity;
    this.registerAttempt(intensity, 320);
    this.state = 'REWARDING';
  }

  lowerDifficulty() {
    this.baseline = Math.max(0.025, this.baseline * 0.9);
    this.applyThreshold();
  }

  private registerAttempt(intensity: number, durationMs: number) {
    this.soundAttempts += 1;
    this.intensitySum += intensity;
    this.durationSum += durationMs;
    this.lastSoundMs = Date.now();
    this.helperShown = false;
  }

  process(rawLevel: number, now = Date.now()): SoundInitiationSnapshot {
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
        this.baseline = clamp01(mid * 0.88 + 0.025);
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

    const generous =
      this.difficulty === 'easy' ? 0.028 : this.difficulty === 'hard' ? 0.06 : 0.04;
    const isSound =
      this.smoothed > this.threshold ||
      this.smoothed > this.baseline + generous ||
      level > this.threshold * 0.88;

    let soundPulse = false;

    if (isSound) {
      this.lastSoundMs = now;
      this.helperShown = false;
      if (this.state === 'HELPING') this.state = 'LISTENING';
      if (!this.wasSounding) {
        soundPulse = true;
        this.registerAttempt(this.smoothed, 0);
        this.state = 'SOUND_DETECTED';
      }
      if (!this.soundStart) this.soundStart = now;
    } else if (this.wasSounding) {
      const dur = this.soundStart != null ? now - this.soundStart : 0;
      if (dur > 80) this.durationSum += dur;
      this.soundStart = null;
      if (this.state === 'SOUND_DETECTED') {
        this.state = 'REWARDING';
      }
    }

    this.wasSounding = isSound;

    if (this.state === 'REWARDING' && !soundPulse) {
      this.state = 'LISTENING';
    }

    const idleMs = now - this.lastSoundMs;
    if (idleMs > IDLE_HELPER_MS && !this.helperShown && this.state === 'LISTENING') {
      this.helperShown = true;
      this.state = 'HELPING';
      this.lowerDifficulty();
    }

    const duration = this.soundStart != null ? now - this.soundStart : 0;

    return {
      ...this.snapshot(soundPulse, now),
      soundPulse,
      soundDetected: isSound,
      intensity: clamp01((this.smoothed - this.baseline) / 0.32),
      duration,
      confidence: isSound ? 0.72 + this.smoothed * 0.28 : 0.22,
      vocalAttempt: this.soundAttempts,
      smoothedLevel: this.smoothed,
      calibrated: true,
    };
  }

  private snapshot(soundPulse: boolean, now: number): SoundInitiationSnapshot {
    return {
      state: this.state,
      soundDetected: this.wasSounding,
      soundPulse,
      intensity: clamp01((this.smoothed - this.baseline) / 0.32),
      duration: this.soundStart != null ? now - this.soundStart : 0,
      confidence: this.wasSounding ? 0.82 : 0.25,
      vocalAttempt: this.soundAttempts,
      smoothedLevel: this.smoothed,
      calibrated: this.calibrated,
    };
  }

  consumeSoundPulse(): boolean {
    if (this.state !== 'SOUND_DETECTED' && this.state !== 'REWARDING') return false;
    this.state = 'LISTENING';
    this.soundStart = null;
    return true;
  }

  getAnalytics(): SoundInitiationAnalytics {
    const n = Math.max(1, this.soundAttempts);
    return {
      soundAttempts: this.soundAttempts,
      engagementTimeMs: Date.now() - this.sessionStart,
      interactionCount: this.soundAttempts,
      averageDuration: this.durationSum / n,
      averageIntensity: this.intensitySum / n,
      lastUpdated: Date.now(),
    };
  }
}
