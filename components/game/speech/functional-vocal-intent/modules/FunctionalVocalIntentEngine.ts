import type {
  FunctionalVocalIntentAnalytics,
  FunctionalVocalIntentDifficulty,
  FunctionalVocalIntentSnapshot,
  FunctionalVocalIntentState,
} from './functionalVocalIntentTypes';

const WINDOW = 5;
const CALIBRATION_SAMPLES = 14;
const IDLE_HELPER_MS = 9000;

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function avg(nums: number[]) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/**
 * Mic amplitude only — intentional vocal communication readiness, no STT.
 * Any sound or Good try counts as communicative participation.
 */
export class FunctionalVocalIntentEngine {
  private state: FunctionalVocalIntentState = 'IDLE';
  private difficulty: FunctionalVocalIntentDifficulty = 'easy';
  private buffer: number[] = [];
  private calibration: number[] = [];
  private calibrated = false;
  private baseline = 0.05;
  private threshold = 0.14;
  private smoothed = 0;
  private wasSounding = false;
  private soundStart: number | null = null;
  private vocalAttempts = 0;
  private interactionAttempts = 0;
  private intensitySum = 0;
  private durationSum = 0;
  private sessionStart = Date.now();
  private lastSoundMs = Date.now();
  private helperShown = false;
  private rewardState: FunctionalVocalIntentSnapshot['rewardState'] = 'NONE';

  configure(difficulty: FunctionalVocalIntentDifficulty) {
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
    this.vocalAttempts = 0;
    this.interactionAttempts = 0;
    this.intensitySum = 0;
    this.durationSum = 0;
    this.sessionStart = Date.now();
    this.lastSoundMs = Date.now();
    this.helperShown = false;
    this.rewardState = 'NONE';
    this.applyThreshold();
  }

  private applyThreshold() {
    const margin =
      this.difficulty === 'easy' ? 0.03 : this.difficulty === 'hard' ? 0.095 : 0.05;
    this.threshold = this.baseline + margin;
  }

  /** Good try / mouth-only tap — counts without mic */
  simulateResponse(intensity = 0.48) {
    this.calibrated = true;
    this.buffer = [intensity, intensity * 0.96, intensity * 0.92, intensity * 0.9, intensity * 0.88];
    this.smoothed = intensity;
    this.registerAttempt(intensity, 300);
    this.state = 'REWARDING';
    this.rewardState = 'SPARKLE';
  }

  lowerDifficulty() {
    this.baseline = Math.max(0.025, this.baseline * 0.9);
    this.applyThreshold();
  }

  private registerAttempt(intensity: number, durationMs: number) {
    this.vocalAttempts += 1;
    this.interactionAttempts += 1;
    this.intensitySum += intensity;
    this.durationSum += durationMs;
    this.lastSoundMs = Date.now();
    this.helperShown = false;
    if (this.interactionAttempts % 3 === 0) this.rewardState = 'HERO';
    else if (this.interactionAttempts % 2 === 0) this.rewardState = 'STAR';
    else this.rewardState = 'SPARKLE';
  }

  process(rawLevel: number, now = Date.now()): FunctionalVocalIntentSnapshot {
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
      this.difficulty === 'easy' ? 0.026 : this.difficulty === 'hard' ? 0.058 : 0.038;
    const isSound =
      this.smoothed > this.threshold ||
      this.smoothed > this.baseline + generous ||
      level > this.threshold * 0.88;

    let responsePulse = false;

    if (isSound) {
      this.lastSoundMs = now;
      this.helperShown = false;
      if (this.state === 'HELPING') this.state = 'LISTENING';
      if (!this.wasSounding) {
        responsePulse = true;
        this.registerAttempt(this.smoothed, 0);
        this.state = 'WAITING_FOR_RESPONSE';
      }
      if (!this.soundStart) this.soundStart = now;
    } else if (this.wasSounding) {
      const dur = this.soundStart != null ? now - this.soundStart : 0;
      if (dur > 80) this.durationSum += dur;
      this.soundStart = null;
      if (this.state === 'WAITING_FOR_RESPONSE') {
        this.state = 'REWARDING';
      }
    }

    this.wasSounding = isSound;

    if (this.state === 'REWARDING' && !responsePulse) {
      this.state = 'LISTENING';
    }

    const idleMs = now - this.lastSoundMs;
    if (idleMs > IDLE_HELPER_MS && !this.helperShown && this.state === 'LISTENING') {
      this.helperShown = true;
      this.state = 'HELPING';
      this.lowerDifficulty();
    }

    const duration = this.soundStart != null ? now - this.soundStart : 0;
    const engagement = clamp01(0.2 + this.interactionAttempts * 0.06 + (now - this.sessionStart) * 0.00008);
    const communicationIntent = clamp01(
      0.35 + this.interactionAttempts * 0.09 + (isSound ? 0.08 : 0),
    );

    return {
      ...this.snapshot(responsePulse, now),
      responsePulse,
      responseDetected: isSound,
      intensity: clamp01((this.smoothed - this.baseline) / 0.32),
      duration,
      vocalAttempt: this.vocalAttempts,
      interactionAttempt: this.interactionAttempts,
      communicationIntent,
      engagementLevel: engagement,
      rewardState: responsePulse ? this.rewardState : 'NONE',
      smoothedLevel: this.smoothed,
      calibrated: true,
    };
  }

  private snapshot(responsePulse: boolean, now: number): FunctionalVocalIntentSnapshot {
    const engagement = clamp01(0.2 + this.interactionAttempts * 0.06 + (now - this.sessionStart) * 0.00008);
    return {
      state: this.state,
      responseDetected: this.wasSounding,
      responsePulse,
      intensity: clamp01((this.smoothed - this.baseline) / 0.32),
      duration: this.soundStart != null ? now - this.soundStart : 0,
      vocalAttempt: this.vocalAttempts,
      interactionAttempt: this.interactionAttempts,
      communicationIntent: clamp01(0.35 + this.interactionAttempts * 0.09),
      engagementLevel: engagement,
      rewardState: this.rewardState,
      smoothedLevel: this.smoothed,
      calibrated: this.calibrated,
    };
  }

  consumeResponsePulse() {
    if (this.state !== 'WAITING_FOR_RESPONSE' && this.state !== 'REWARDING') return false;
    this.state = 'LISTENING';
    this.soundStart = null;
    return true;
  }

  getAnalytics(completedGames = 0): FunctionalVocalIntentAnalytics {
    const n = Math.max(1, this.vocalAttempts);
    return {
      vocalAttempts: this.vocalAttempts,
      interactionAttempts: this.interactionAttempts,
      engagementTimeMs: Date.now() - this.sessionStart,
      averageDuration: this.durationSum / n,
      averageIntensity: this.intensitySum / n,
      completedGames,
      lastUpdated: Date.now(),
    };
  }
}
