import { PoseClassificationSystem, type LipPose } from './PoseClassificationSystem';
import type { LipTransitionSnapshot } from './lipTransitionTypes';

export const UPPER_LIP_INDEX = 13;
export const LOWER_LIP_INDEX = 17;
export const LEFT_LIP_CORNER_INDEX = 61;
export const RIGHT_LIP_CORNER_INDEX = 291;

export const ALLOWED_BREAK_MS = 400;
export const POSE_CONFIRM_MS = 500;
export const MIN_TRANSITION_MS = 500;
export const MAX_TRANSITION_MS = 2000;

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function ratiosFromLandmarks(
  upper: { x: number; y: number } | null | undefined,
  lower: { x: number; y: number } | null | undefined,
  left: { x: number; y: number } | null | undefined,
  right: { x: number; y: number } | null | undefined,
): { roundness: number; spread: number } | null {
  if (!upper || !lower || !left || !right) return null;
  const mouthWidth = dist(left, right);
  const mouthHeight = dist(upper, lower);
  if (mouthWidth < 0.001 || mouthHeight < 0.001) return null;
  return {
    roundness: mouthHeight / mouthWidth,
    spread: mouthWidth / mouthHeight,
  };
}

/** Tracks pose classification, hold confirmation, and transition events. */
export class LipTransitionEngine {
  private classifier = new PoseClassificationSystem();
  private stablePose: LipPose = 'NEUTRAL';
  private poseSince: number | null = null;
  private poseHoldDuration = 0;
  private breakStart: number | null = null;
  private unstableFrames = 0;
  private lastTransition: LipTransitionSnapshot['lastTransition'] = null;

  reset() {
    this.classifier.reset();
    this.stablePose = 'NEUTRAL';
    this.poseSince = null;
    this.poseHoldDuration = 0;
    this.breakStart = null;
    this.unstableFrames = 0;
    this.lastTransition = null;
  }

  processRatios(
    roundness: number | null,
    spread: number | null,
    now = Date.now(),
  ): LipTransitionSnapshot {
    if (roundness == null || spread == null || !Number.isFinite(roundness) || !Number.isFinite(spread)) {
      this.unstableFrames += 1;
      return this.snapshot('NEUTRAL', 0, 0, true, false);
    }

    this.unstableFrames = Math.max(0, this.unstableFrames - 1);
    const { pose: rawPose, smoothedRound, smoothedSpread } = this.classifier.push(roundness, spread);
    const inGracePeriod = this.updateStablePose(rawPose, now);
    const lipPose = inGracePeriod ? this.stablePose : rawPose;
    const confirmedPose =
      this.poseSince != null && now - this.poseSince >= POSE_CONFIRM_MS && lipPose === this.stablePose;

  const confidence = Math.min(1, Math.max(0.35, 1 - this.unstableFrames / 20));

    return {
      lipPose,
      confirmedPose,
      poseHoldDuration: this.poseHoldDuration,
      smoothedRound,
      smoothedSpread,
      confidence,
      unstable: this.unstableFrames > 8,
      inGracePeriod,
      lastTransition: this.lastTransition,
    };
  }

  private updateStablePose(rawPose: LipPose, now: number): boolean {
    if (rawPose === this.stablePose) {
      this.breakStart = null;
      if (this.poseSince == null) this.poseSince = now;
      this.poseHoldDuration = now - this.poseSince;
      return false;
    }

    if (this.breakStart == null) {
      this.breakStart = now;
    }

    if (now - this.breakStart <= ALLOWED_BREAK_MS) {
      return true;
    }

    const prev = this.stablePose;
    const heldMs = this.poseHoldDuration;
    if (heldMs >= POSE_CONFIRM_MS && now - this.breakStart >= MIN_TRANSITION_MS) {
      this.lastTransition = { from: prev, to: rawPose, at: now };
    }

    this.stablePose = rawPose;
    this.poseSince = now;
    this.poseHoldDuration = 0;
    this.breakStart = null;
    return false;
  }

  private snapshot(
    pose: LipPose,
    smoothedRound: number,
    smoothedSpread: number,
    unstable: boolean,
    inGracePeriod: boolean,
  ): LipTransitionSnapshot {
    return {
      lipPose: pose,
      confirmedPose: false,
      poseHoldDuration: this.poseHoldDuration,
      smoothedRound,
      smoothedSpread,
      confidence: Math.max(0, 1 - this.unstableFrames / 15),
      unstable,
      inGracePeriod,
      lastTransition: this.lastTransition,
    };
  }
}

/** Validates ordered pose sequences for alternation games. */
export class TransitionSequenceTracker {
  private stepIndex = 0;
  private lastAdvanceAt: number | null = null;

  constructor(readonly sequence: LipPose[]) {}

  reset() {
    this.stepIndex = 0;
    this.lastAdvanceAt = null;
  }

  get expected(): LipPose | null {
    return this.sequence[this.stepIndex] ?? null;
  }

  get progress() {
    return this.sequence.length ? this.stepIndex / this.sequence.length : 0;
  }

  get complete() {
    return this.stepIndex >= this.sequence.length;
  }

  tryAdvance(pose: LipPose, confirmed: boolean, now: number): boolean {
    if (this.complete || !confirmed) return false;
    const expected = this.expected;
    if (!expected || pose !== expected) return false;
    if (this.lastAdvanceAt != null && now - this.lastAdvanceAt < POSE_CONFIRM_MS) return false;
    this.stepIndex += 1;
    this.lastAdvanceAt = now;
    return true;
  }
}

export type { LipPose };
