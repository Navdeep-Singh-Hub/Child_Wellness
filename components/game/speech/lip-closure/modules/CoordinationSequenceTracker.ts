import type { CoordinationPose } from './lipCoordinationTypes';

export const MIN_HOLD_MS = 300;
export const MAX_HOLD_MS = 1200;
export const POSE_SETTLE_MS = 350;
export const ALLOWED_BREAK_MS = 500;

/**
 * Validates ordered lip pose sequences with hold timing and break tolerance.
 */
export class CoordinationSequenceTracker {
  private stepIndex = 0;
  private poseEnteredAt: number | null = null;
  private breakStart: number | null = null;
  private partialCredit = 0;

  constructor(readonly sequence: CoordinationPose[]) {}

  reset() {
    this.stepIndex = 0;
    this.poseEnteredAt = null;
    this.breakStart = null;
    this.partialCredit = 0;
  }

  get expected(): CoordinationPose | null {
    return this.sequence[this.stepIndex] ?? null;
  }

  get progress() {
    return this.sequence.length ? this.stepIndex / this.sequence.length : 0;
  }

  get complete() {
    return this.stepIndex >= this.sequence.length;
  }

  get stepsDone() {
    return this.stepIndex;
  }

  /** Soft match: NEUTRAL can count as partial toward ROUNDED/SPREAD when close. */
  private poseMatches(expected: CoordinationPose, actual: CoordinationPose): boolean {
    if (actual === expected) return true;
    if (expected === 'ROUNDED' && actual === 'NEUTRAL') return true;
    if (expected === 'SPREAD' && actual === 'NEUTRAL') return true;
    return false;
  }

  tryAdvance(pose: CoordinationPose, holdMs: number, now: number): boolean {
    if (this.complete) return false;
    const expected = this.expected;
    if (!expected) return false;

    const matches = this.poseMatches(expected, pose);

    if (matches && holdMs >= MIN_HOLD_MS) {
      this.stepIndex += 1;
      this.poseEnteredAt = null;
      this.breakStart = null;
      this.partialCredit = 0;
      return true;
    }

    if (!matches) {
      if (this.breakStart == null) this.breakStart = now;
      if (now - this.breakStart > ALLOWED_BREAK_MS) {
        this.poseEnteredAt = null;
      }
      if (pose !== expected) {
        this.partialCredit = Math.min(0.4, this.partialCredit + 0.05);
      }
    } else {
      this.breakStart = null;
      if (this.poseEnteredAt == null) this.poseEnteredAt = now;
    }

    return false;
  }

  /** Rhythm mode: advance on beat if pose matches (lower hold requirement). */
  tryAdvanceOnBeat(pose: CoordinationPose, onBeat: boolean): boolean {
    if (this.complete || !onBeat) return false;
    const expected = this.expected;
    if (!expected || !this.poseMatches(expected, pose)) return false;
    this.stepIndex += 1;
    this.poseEnteredAt = null;
    this.breakStart = null;
    return true;
  }
}
