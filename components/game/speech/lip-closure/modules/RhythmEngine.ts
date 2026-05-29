import type { RhythmDifficulty } from './lipCoordinationTypes';

const TOLERANCE_MS = 400;

/** Simple beat scheduler — no music ML. */
export class RhythmEngine {
  private intervalMs = 800;
  private nextBeatAt = 0;
  private beatIndex = 0;
  private startedAt = 0;
  private running = false;
  private lastBeatAt = 0;

  readonly toleranceMs = TOLERANCE_MS;

  configure(difficulty: RhythmDifficulty) {
    this.intervalMs = difficulty === 'easy' ? 1200 : difficulty === 'hard' ? 500 : 800;
  }

  get interval() {
    return this.intervalMs;
  }

  start(now = Date.now()) {
    this.running = true;
    this.startedAt = now;
    this.lastBeatAt = now;
    this.nextBeatAt = now + this.intervalMs;
    this.beatIndex = 0;
  }

  stop() {
    this.running = false;
  }

  reset() {
    this.stop();
    this.beatIndex = 0;
  }

  tick(now = Date.now()) {
    if (!this.running) {
      return {
        beatPulse: false,
        beatActive: false,
        beatIndex: this.beatIndex,
        pulsePhase: 0,
        intervalMs: this.intervalMs,
      };
    }

    let beatPulse = false;
    if (now >= this.nextBeatAt) {
      beatPulse = true;
      this.beatIndex += 1;
      this.lastBeatAt = now;
      this.nextBeatAt = now + this.intervalMs;
    }

    const elapsed = now - this.startedAt;
    const pulsePhase = (elapsed % this.intervalMs) / this.intervalMs;
    const msToBeat = this.nextBeatAt - now;
    const msSinceBeat = now - this.lastBeatAt;
    const beatActive = msToBeat <= TOLERANCE_MS || msSinceBeat <= TOLERANCE_MS;

    return {
      beatPulse,
      beatActive,
      beatIndex: this.beatIndex,
      pulsePhase,
      intervalMs: this.intervalMs,
    };
  }

  /** Whether an action at `actionAt` landed near a beat. */
  isOnBeat(actionAt: number, now = Date.now()) {
    const phase = (actionAt - this.startedAt) % this.intervalMs;
    const dist = Math.min(phase, this.intervalMs - phase);
    return dist <= TOLERANCE_MS;
  }
}
