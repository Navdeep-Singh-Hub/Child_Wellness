import type {
  SoundStabilityAnalytics,
  SoundStabilityDifficulty,
  SoundStabilitySnapshot,
  SoundStabilityState,
} from './soundStabilityTypes';

const WINDOW = 5;
const CALIBRATION_SAMPLES = 14;
const IDLE_HELPER_MS = 9000;
const MIN_BOUT_MS = 80;

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function avg(nums: number[]) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/**
 * Mic amplitude only — sustained sound readiness, no STT.
 * Rewards any vocal hold; weak or brief sounds still count.
 */
export class SoundStabilityEngine {
  private state: SoundStabilityState = 'IDLE';
  private difficulty: SoundStabilityDifficulty = 'easy';
  private buffer: number[] = [];
  private calibration: number[] = [];
  private calibrated = false;
  private baseline = 0.05;
  private threshold = 0.14;
  private smoothed = 0;
  private wasSounding = false;
  private soundStart: number | null = null;
  private vocalAttempts = 0;
  private stabilityAttempts = 0;
  private totalSustainMs = 0;
  private lastSustainMs = 0;
  private intensitySum = 0;
  private sessionStart = Date.now();
  private lastActivityMs = Date.now();
  private helperShown = false;
  private rewardState: SoundStabilitySnapshot['rewardState'] = 'NONE';
  private stabilityPulse = false;
  private targetSustainMs = 900;
  private minSustainMs = 150;

  configure(difficulty: SoundStabilityDifficulty) {
    this.difficulty = difficulty;
    this.applyThreshold();
    this.applySustainTargets();
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
    this.vocalAttempts = 0;
    this.stabilityAttempts = 0;
    this.totalSustainMs = 0;
    this.lastSustainMs = 0;
    this.intensitySum = 0;
    this.sessionStart = Date.now();
    this.lastActivityMs = Date.now();
    this.helperShown = false;
    this.rewardState = 'NONE';
    this.stabilityPulse = false;
    this.applyThreshold();
    this.applySustainTargets();
  }

  private applyThreshold() {
    const margin =
      this.difficulty === 'easy' ? 0.03 : this.difficulty === 'hard' ? 0.095 : 0.05;
    this.threshold = this.baseline + margin;
  }

  private applySustainTargets() {
    if (this.difficulty === 'easy') {
      this.targetSustainMs = 900;
      this.minSustainMs = 150;
    } else if (this.difficulty === 'hard') {
      this.targetSustainMs = 1500;
      this.minSustainMs = 400;
    } else {
      this.targetSustainMs = 1100;
      this.minSustainMs = 250;
    }
  }

  lowerDifficulty() {
    this.baseline = Math.max(0.025, this.baseline * 0.9);
    this.targetSustainMs = Math.max(600, this.targetSustainMs * 0.88);
    this.minSustainMs = Math.max(100, this.minSustainMs * 0.85);
    this.applyThreshold();
  }

  /** Good try — counts as a gentle sustained attempt without mic */
  simulateSustain(durationMs?: number) {
    this.calibrated = true;
    const ms = durationMs ?? Math.round(this.targetSustainMs * 0.55);
    const intensity = 0.46;
    this.buffer = [intensity, intensity * 0.95, intensity * 0.9, intensity * 0.88, intensity * 0.86];
    this.smoothed = intensity;
    this.registerStability(ms, intensity);
    this.wasSounding = false;
    this.soundStart = null;
    this.state = 'REWARDING';
  }

  private registerStability(durationMs: number, intensity: number) {
    if (durationMs < MIN_BOUT_MS) return;
    this.vocalAttempts += 1;
    this.stabilityAttempts += 1;
    this.lastSustainMs = durationMs;
    this.totalSustainMs += durationMs;
    this.intensitySum += intensity;
    this.lastActivityMs = Date.now();
    this.helperShown = false;
    this.stabilityPulse = true;
    if (this.stabilityAttempts % 3 === 0) this.rewardState = 'HERO';
    else if (this.stabilityAttempts % 2 === 0) this.rewardState = 'STAR';
    else this.rewardState = 'SPARKLE';
  }

  process(rawLevel: number, now = Date.now()): SoundStabilitySnapshot {
    if (this.state === 'PAUSED') {
      return this.snapshot(now);
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
        ...this.snapshot(now),
        smoothedLevel: level,
        calibrated: false,
      };
    }

    this.buffer.push(level);
    if (this.buffer.length > WINDOW) this.buffer.shift();
    this.smoothed = avg(this.buffer);

    const generous =
      this.difficulty === 'easy' ? 0.026 : this.difficulty === 'hard' ? 0.058 : 0.038;
    const isSound =
      this.smoothed > this.threshold ||
      this.smoothed > this.baseline + generous ||
      level > this.threshold * 0.88;

    let currentDuration = 0;

    if (isSound) {
      this.lastActivityMs = now;
      this.helperShown = false;
      if (this.state === 'HELPING') this.state = 'LISTENING';
      if (!this.wasSounding) {
        this.soundStart = now;
        this.state = 'SOUND_ACTIVE';
      }
      currentDuration = this.soundStart != null ? now - this.soundStart : 0;
    } else if (this.wasSounding) {
      currentDuration = this.soundStart != null ? now - this.soundStart : 0;
      if (currentDuration >= MIN_BOUT_MS) {
        this.registerStability(currentDuration, this.smoothed);
        this.state = 'REWARDING';
      }
      this.soundStart = null;
    }

    this.wasSounding = isSound;

    if (this.state === 'REWARDING' && !this.stabilityPulse) {
      this.state = 'LISTENING';
    }

    const idleMs = now - this.lastActivityMs;
    if (idleMs > IDLE_HELPER_MS && !this.helperShown && this.state === 'LISTENING') {
      this.helperShown = true;
      this.state = 'HELPING';
      this.lowerDifficulty();
    }

    if (isSound && this.state !== 'SOUND_ACTIVE') {
      this.state = 'SOUND_ACTIVE';
    }

    return this.snapshot(now, isSound, currentDuration);
  }

  private snapshot(now: number, isSound = false, currentDuration = 0): SoundStabilitySnapshot {
    const activeDur =
      isSound && this.soundStart != null ? now - this.soundStart : currentDuration || this.lastSustainMs;
    const sustainGlow = isSound
      ? clamp01(activeDur / this.targetSustainMs)
      : clamp01(this.lastSustainMs / this.targetSustainMs);
    const engagement = clamp01(
      0.2 + this.stabilityAttempts * 0.06 + (now - this.sessionStart) * 0.00007,
    );

    return {
      state: this.state,
      soundActive: isSound,
      stabilityPulse: this.stabilityPulse,
      intensity: clamp01((this.smoothed - this.baseline) / 0.32),
      sustainedDuration: activeDur,
      vocalAttempt: this.vocalAttempts,
      stabilityAttempt: this.stabilityAttempts,
      engagementLevel: engagement,
      rewardState: this.stabilityPulse ? this.rewardState : 'NONE',
      sustainGlow,
      smoothedLevel: this.smoothed,
      calibrated: this.calibrated,
    };
  }

  consumeStabilityPulse() {
    if (!this.stabilityPulse) return false;
    this.stabilityPulse = false;
    if (this.state === 'REWARDING') {
      this.state = 'LISTENING';
    }
    return true;
  }

  getAnalytics(completedGames = 0): SoundStabilityAnalytics {
    const n = Math.max(1, this.stabilityAttempts);
    return {
      vocalAttempts: this.vocalAttempts,
      sustainedDuration: this.totalSustainMs,
      stabilityAttempts: this.stabilityAttempts,
      engagementTimeMs: Date.now() - this.sessionStart,
      averageSustainMs: this.totalSustainMs / n,
      completedGames,
      lastUpdated: Date.now(),
    };
  }
}
