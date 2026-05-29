import type { FunctionalSequenceStep, FunctionalStepType } from './functionalSequenceTypes';
import type { ResistancePose } from './ResistancePoseSystem';

export const ALLOWED_BREAK_MS = 600;
export const MIN_POSE_HOLD_MS = 250;

function isPoseStep(state: FunctionalStepType): state is ResistancePose {
  return state !== 'BURST' && state !== 'AIRFLOW';
}

function poseMatches(expected: ResistancePose, actual: ResistancePose): boolean {
  if (actual === expected) return true;
  if (expected === 'ROUNDED' && (actual === 'NEUTRAL' || actual === 'CLOSED')) return true;
  if (expected === 'SPREAD' && actual === 'NEUTRAL') return true;
  return false;
}

/**
 * Validates ordered functional lip sequences with hold timing and recovery tolerance.
 */
export class FunctionalSequenceTracker {
  private stepIndex = 0;
  private stepEnteredAt: number | null = null;
  private breakStart: number | null = null;
  private burstArmed = false;
  private airflowAccum = 0;

  constructor(readonly steps: FunctionalSequenceStep[]) {}

  reset() {
    this.stepIndex = 0;
    this.stepEnteredAt = null;
    this.breakStart = null;
    this.burstArmed = false;
    this.airflowAccum = 0;
  }

  get current(): FunctionalSequenceStep | null {
    return this.steps[this.stepIndex] ?? null;
  }

  get progress() {
    return this.steps.length ? this.stepIndex / this.steps.length : 0;
  }

  get complete() {
    return this.stepIndex >= this.steps.length;
  }

  get stepsDone() {
    return this.stepIndex;
  }

  tick(
    pose: ResistancePose,
    poseHoldMs: number,
    lipsClosed: boolean,
    audioSpike: boolean,
    airflowActive: boolean,
    now: number,
    deltaMs = 50,
  ): boolean {
    if (this.complete) return false;
    const step = this.current;
    if (!step) return false;

    if (step.state === 'BURST') {
      if (lipsClosed) this.burstArmed = true;
      if (this.burstArmed && audioSpike) {
        this.advance(now);
        return true;
      }
      if (this.stepEnteredAt == null) this.stepEnteredAt = now;
      if (audioSpike && now - (this.stepEnteredAt ?? now) > 150) {
        this.advance(now);
        return true;
      }
      return false;
    }

    if (step.state === 'AIRFLOW') {
      if (airflowActive) {
        this.airflowAccum += deltaMs;
      } else {
        this.airflowAccum = Math.max(0, this.airflowAccum - deltaMs * 0.5);
      }
      const target = Math.max(MIN_POSE_HOLD_MS, step.hold * 0.45);
      if (this.airflowAccum >= target) {
        this.advance(now);
        return true;
      }
      if (this.stepEnteredAt == null) this.stepEnteredAt = now;
      return false;
    }

    const expected = step.state;
    const matches = poseMatches(expected, pose);
    const targetHold = Math.max(MIN_POSE_HOLD_MS, step.hold * 0.45);

    if (matches) {
      this.breakStart = null;
      if (this.stepEnteredAt == null) this.stepEnteredAt = now;
      if (poseHoldMs >= targetHold) {
        this.advance(now);
        return true;
      }
    } else {
      if (this.breakStart == null) this.breakStart = now;
      if (now - this.breakStart > ALLOWED_BREAK_MS) {
        this.stepEnteredAt = null;
      }
    }

    return false;
  }

  private advance(now: number) {
    this.stepIndex += 1;
    this.stepEnteredAt = null;
    this.breakStart = null;
    this.burstArmed = false;
    this.airflowAccum = 0;
  }
}
