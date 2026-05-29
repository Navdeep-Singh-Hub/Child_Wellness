import { AudioBurstEngine } from './AudioBurstEngine';
import { LipDetectionEngine } from './LipDetectionEngine';
import type { BilabialEvent, BilabialPrepGameState, BilabialPrepSnapshot } from './lipBilabialTypes';

export const MIN_BURST_AFTER_CLOSE_MS = 200;
export const MAX_BURST_AFTER_CLOSE_MS = 900;

/**
 * Hybrid bilabial prep: lips closed → audio burst within tolerance window.
 * No phoneme recognition.
 */
export class BilabialEngine {
  readonly lipEngine = new LipDetectionEngine();
  readonly audioEngine = new AudioBurstEngine(350);

  state: BilabialPrepGameState = 'IDLE';
  closureAt: number | null = null;
  lastEvent: BilabialEvent | null = null;
  attemptCount = 0;
  successCount = 0;
  microBreaks = 0;

  reset() {
    this.lipEngine.reset();
    this.audioEngine.reset();
    this.state = 'IDLE';
    this.closureAt = null;
    this.lastEvent = null;
  }

  startSession() {
    this.state = 'WAITING_FOR_CLOSURE';
    this.closureAt = null;
    this.attemptCount += 1;
  }

  process(
    lipGap: number | null,
    audioLevel: number,
    lipsClosedOverride: boolean | null,
    now = Date.now(),
  ): BilabialPrepSnapshot {
    const lipSnap = this.lipEngine.processGap(lipGap ?? 99);
    const lipsClosed = lipsClosedOverride ?? lipSnap.lipsClosed;
    const { audioSpike } = this.audioEngine.push(audioLevel, now);

    this.tickState(lipsClosed, audioSpike, now);

    return {
      lipsClosed,
      audioLevel,
      audioSpike,
      state: this.state,
      lastEvent: this.lastEvent,
      confidence: lipSnap.confidence,
      unstable: lipSnap.unstable,
    };
  }

  private tickState(lipsClosed: boolean, audioSpike: boolean, now: number) {
    if (this.state === 'PAUSED' || this.state === 'IDLE') return;

    if (this.state === 'WAITING_FOR_CLOSURE') {
      if (lipsClosed) {
        this.state = 'WAITING_FOR_SOUND';
        this.closureAt = now;
      }
      return;
    }

    if (this.state === 'WAITING_FOR_SOUND') {
      if (!lipsClosed) {
        if (this.closureAt != null && now - this.closureAt > MAX_BURST_AFTER_CLOSE_MS) {
          this.microBreaks += 1;
          this.state = 'WAITING_FOR_CLOSURE';
          this.closureAt = null;
        }
        return;
      }

      if (audioSpike && this.closureAt != null) {
        const timingMs = now - this.closureAt;
        if (timingMs >= MIN_BURST_AFTER_CLOSE_MS && timingMs <= MAX_BURST_AFTER_CLOSE_MS) {
          this.registerSuccess(timingMs, now);
        } else if (timingMs > MAX_BURST_AFTER_CLOSE_MS) {
          this.microBreaks += 1;
          this.closureAt = now;
        }
      } else if (this.closureAt != null && now - this.closureAt > MAX_BURST_AFTER_CLOSE_MS) {
        this.microBreaks += 1;
        this.state = 'WAITING_FOR_CLOSURE';
        this.closureAt = null;
      }
      return;
    }

    if (this.state === 'SUCCESS' || this.state === 'REWARDING') {
      return;
    }
  }

  private registerSuccess(timingMs: number, now: number) {
    this.successCount += 1;
    this.lastEvent = { at: now, timingMs };
    this.state = 'SUCCESS';
    this.closureAt = null;
  }

  consumeSuccess(): BilabialEvent | null {
    if (this.state !== 'SUCCESS' && this.state !== 'REWARDING') return null;
    const ev = this.lastEvent;
    this.state = 'WAITING_FOR_CLOSURE';
    this.closureAt = null;
    return ev;
  }

  showHelp() {
    this.state = 'HELPING';
  }

  resume() {
    this.state = 'WAITING_FOR_CLOSURE';
    this.closureAt = null;
  }
}
