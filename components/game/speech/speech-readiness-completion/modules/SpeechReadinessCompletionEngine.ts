import type {
  ParticipationType,
  SpeechReadinessCompletionAnalytics,
  SpeechReadinessCompletionDifficulty,
  SpeechReadinessCompletionSnapshot,
  SpeechReadinessCompletionState,
} from './speechReadinessCompletionTypes';

const WINDOW = 5;
const CALIBRATION_SAMPLES = 14;
const IDLE_HELPER_MS = 9000;
const SEQUENCE_TARGET = 6;

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function avg(nums: number[]) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/**
 * Mic amplitude + playful imitation taps — Level 6 capstone, no STT.
 */
export class SpeechReadinessCompletionEngine {
  private state: SpeechReadinessCompletionState = 'IDLE';
  private difficulty: SpeechReadinessCompletionDifficulty = 'easy';
  private buffer: number[] = [];
  private calibration: number[] = [];
  private calibrated = false;
  private baseline = 0.05;
  private threshold = 0.14;
  private smoothed = 0;
  private wasSounding = false;
  private soundStart: number | null = null;
  private vocalAttempts = 0;
  private imitationAttempts = 0;
  private intensitySum = 0;
  private durationSum = 0;
  private sessionStart = Date.now();
  private lastActivityMs = Date.now();
  private helperShown = false;
  private rewardState: SpeechReadinessCompletionSnapshot['rewardState'] = 'NONE';
  private participationPulse = false;
  private participationType: ParticipationType | null = null;
  private promptTimer: ReturnType<typeof setTimeout> | null = null;

  configure(difficulty: SpeechReadinessCompletionDifficulty) {
    this.difficulty = difficulty;
    this.applyThreshold();
  }

  reset() {
    this.clearPromptTimer();
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
    this.imitationAttempts = 0;
    this.intensitySum = 0;
    this.durationSum = 0;
    this.sessionStart = Date.now();
    this.lastActivityMs = Date.now();
    this.helperShown = false;
    this.rewardState = 'NONE';
    this.participationPulse = false;
    this.participationType = null;
    this.applyThreshold();
  }

  private clearPromptTimer() {
    if (this.promptTimer) {
      clearTimeout(this.promptTimer);
      this.promptTimer = null;
    }
  }

  private applyThreshold() {
    const margin =
      this.difficulty === 'easy' ? 0.03 : this.difficulty === 'hard' ? 0.095 : 0.05;
    this.threshold = this.baseline + margin;
  }

  /** Show a mouth / rhythm cue before child tries */
  showPrompt(durationMs = 1800) {
    this.clearPromptTimer();
    this.state = 'SHOWING_PROMPT';
    this.participationPulse = false;
    this.participationType = null;
    this.promptTimer = setTimeout(() => {
      this.state = 'WAITING_FOR_ATTEMPT';
      this.promptTimer = null;
    }, durationMs);
  }

  /** Good try — vocal participation without mic */
  simulateResponse(intensity = 0.48) {
    this.registerParticipation('vocal', intensity, 280);
  }

  /** Mouth copy / tap — imitation counts */
  simulateImitation(intensity = 0.42) {
    this.registerParticipation('imitation', intensity, 220);
  }

  lowerDifficulty() {
    this.baseline = Math.max(0.025, this.baseline * 0.9);
    this.applyThreshold();
  }

  private registerParticipation(type: ParticipationType, intensity: number, durationMs: number) {
    this.calibrated = true;
    this.buffer = [intensity, intensity * 0.95, intensity * 0.9, intensity * 0.88, intensity * 0.85];
    this.smoothed = intensity;
    if (type === 'vocal') this.vocalAttempts += 1;
    else this.imitationAttempts += 1;
    this.intensitySum += intensity;
    this.durationSum += durationMs;
    this.lastActivityMs = Date.now();
    this.helperShown = false;
    this.participationPulse = true;
    this.participationType = type;
    this.wasSounding = true;
    this.state = 'REWARDING';
    const total = this.vocalAttempts + this.imitationAttempts;
    if (total % 4 === 0) this.rewardState = 'GRADUATION';
    else if (total % 2 === 0) this.rewardState = 'STAR';
    else this.rewardState = 'SPARKLE';
  }

  process(rawLevel: number, now = Date.now()): SpeechReadinessCompletionSnapshot {
    if (this.state === 'PAUSED') {
      return this.snapshot(false, now);
    }
    if (this.state === 'IDLE') {
      this.state = 'LISTENING';
    }
    if (this.state === 'SHOWING_PROMPT') {
      return this.snapshot(false, now);
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

    if (isSound && (this.state === 'WAITING_FOR_ATTEMPT' || this.state === 'LISTENING')) {
      this.lastActivityMs = now;
      this.helperShown = false;
      if (!this.wasSounding) {
        this.registerParticipation('vocal', this.smoothed, 0);
      }
      if (!this.soundStart) this.soundStart = now;
    } else if (this.wasSounding && !isSound) {
      const dur = this.soundStart != null ? now - this.soundStart : 0;
      if (dur > 80) this.durationSum += dur;
      this.soundStart = null;
    }

    this.wasSounding = isSound;

    if (this.state === 'REWARDING' && !this.participationPulse) {
      this.state = 'LISTENING';
    }

    const idleMs = now - this.lastActivityMs;
    if (
      idleMs > IDLE_HELPER_MS &&
      !this.helperShown &&
      (this.state === 'LISTENING' || this.state === 'WAITING_FOR_ATTEMPT')
    ) {
      this.helperShown = true;
      this.state = 'HELPING';
      this.lowerDifficulty();
    }

    return this.snapshot(false, now);
  }

  private sequenceProgressValue() {
    const total = this.vocalAttempts + this.imitationAttempts;
    return clamp01(total / SEQUENCE_TARGET);
  }

  private participationLevelValue() {
    const total = this.vocalAttempts + this.imitationAttempts;
    return clamp01(0.25 + total * 0.11 + this.sequenceProgressValue() * 0.2);
  }

  private snapshot(_unused: boolean, now: number): SpeechReadinessCompletionSnapshot {
    const engagement = clamp01(
      0.2 + (this.vocalAttempts + this.imitationAttempts) * 0.05 + (now - this.sessionStart) * 0.00007,
    );
    return {
      state: this.state,
      responseDetected: this.wasSounding,
      participationPulse: this.participationPulse,
      participationType: this.participationType,
      intensity: clamp01((this.smoothed - this.baseline) / 0.32),
      duration: this.soundStart != null ? now - this.soundStart : 0,
      vocalAttempt: this.vocalAttempts,
      imitationAttempt: this.imitationAttempts,
      participationLevel: this.participationLevelValue(),
      sequenceProgress: this.sequenceProgressValue(),
      engagementLevel: engagement,
      rewardState: this.participationPulse ? this.rewardState : 'NONE',
      smoothedLevel: this.smoothed,
      calibrated: this.calibrated,
    };
  }

  consumeParticipationPulse() {
    if (!this.participationPulse) return false;
    this.participationPulse = false;
    const type = this.participationType;
    this.participationType = null;
    if (this.state === 'REWARDING') {
      this.state = 'LISTENING';
    }
    this.soundStart = null;
    return type != null;
  }

  getAnalytics(completedGames = 0): SpeechReadinessCompletionAnalytics {
    const n = Math.max(1, this.vocalAttempts + this.imitationAttempts);
    return {
      vocalAttempts: this.vocalAttempts,
      imitationAttempts: this.imitationAttempts,
      engagementTimeMs: Date.now() - this.sessionStart,
      participationLevel: this.participationLevelValue(),
      averageDuration: this.durationSum / n,
      averageIntensity: this.intensitySum / n,
      completedGames,
      lastUpdated: Date.now(),
    };
  }
}
