import { CoordinationSequenceTracker } from './CoordinationSequenceTracker';
import { LipPostureEngine } from './LipPostureEngine';
import type { ResistancePose } from './ResistancePoseSystem';
import { RhythmEngine } from './RhythmEngine';
import type {
  CoordinationPose,
  LipCoordinationGameState,
  LipCoordinationSnapshot,
  RhythmDifficulty,
} from './lipCoordinationTypes';

export const ALLOWED_BREAK_MS = 500;

/**
 * Lip posture + sequence coordination + optional rhythm (Session 39).
 */
export class LipCoordinationEngine {
  readonly postureEngine = new LipPostureEngine();
  readonly rhythmEngine = new RhythmEngine();
  sequenceTracker = new CoordinationSequenceTracker([]);

  state: LipCoordinationGameState = 'IDLE';
  attemptCount = 0;
  fatigueIndicators = 0;
  coordinationScore = 0;
  timingAccuracy = 0;
  private stablePose: CoordinationPose = 'NEUTRAL';
  private poseSince: number | null = null;
  private breakStart: number | null = null;

  reset() {
    this.postureEngine.reset();
    this.rhythmEngine.reset();
    this.sequenceTracker.reset();
    this.state = 'IDLE';
    this.coordinationScore = 0;
    this.stablePose = 'NEUTRAL';
    this.poseSince = null;
    this.breakStart = null;
  }

  setSequence(sequence: CoordinationPose[]) {
    this.sequenceTracker = new CoordinationSequenceTracker(sequence);
  }

  startSession(sequence: CoordinationPose[], rhythmDifficulty?: RhythmDifficulty) {
    this.setSequence(sequence);
    this.attemptCount += 1;
    this.state = 'DETECTING';
    if (rhythmDifficulty) {
      this.rhythmEngine.configure(rhythmDifficulty);
      this.rhythmEngine.start();
      this.state = 'WAITING_FOR_BEAT';
    } else {
      this.state = 'COORDINATING';
    }
  }

  process(
    lipGap: number | null,
    roundness: number | null,
    spread: number | null,
    mouthWidth: number | null,
    mouthHeight: number | null,
    poseOverride: ResistancePose | null,
    now = Date.now(),
  ): LipCoordinationSnapshot {
    const posture = this.postureEngine.process(
      lipGap,
      roundness,
      spread,
      mouthWidth,
      mouthHeight,
    );
    const rawPose = poseOverride ?? posture.lipPose;
    const inGracePeriod = this.updateStablePose(rawPose, now);
    const lipPose = inGracePeriod ? this.stablePose : rawPose;
    const poseHoldMs = this.poseSince != null ? now - this.poseSince : 0;
    const poseConfirmed = poseHoldMs >= 350 && lipPose === this.stablePose;

    const rhythm = this.rhythmEngine.tick(now);
    let advanced = false;

    if (this.state === 'COORDINATING' || this.state === 'WAITING_FOR_BEAT') {
      if (this.state === 'WAITING_FOR_BEAT' && rhythm.beatActive) {
        advanced = this.sequenceTracker.tryAdvanceOnBeat(lipPose, true);
        if (advanced) {
          this.timingAccuracy = Math.min(1, this.timingAccuracy + 0.15);
        }
      } else if (poseConfirmed) {
        advanced = this.sequenceTracker.tryAdvance(lipPose, poseHoldMs, now);
      }

      if (advanced) {
        this.coordinationScore = Math.min(1, this.coordinationScore + 1 / Math.max(1, this.sequenceTracker.sequence.length));
      }

      if (this.sequenceTracker.complete) {
        this.state = 'SUCCESS';
      }
    }

    const helpfulHint = this.buildHint(lipPose, this.sequenceTracker.expected, rhythm.beatActive);

    return {
      lipPose,
      poseHoldMs,
      poseConfirmed,
      coordinationScore: this.coordinationScore,
      sequenceProgress: this.sequenceTracker.progress,
      state: this.state,
      confidence: poseOverride ? 0.85 : posture.confidence,
      unstable: poseOverride ? false : posture.unstable,
      inGracePeriod,
      helpfulHint,
      beatPulse: rhythm.beatPulse,
      beatActive: rhythm.beatActive,
      pulsePhase: rhythm.pulsePhase,
    };
  }

  private updateStablePose(rawPose: CoordinationPose, now: number): boolean {
    if (rawPose === this.stablePose) {
      this.breakStart = null;
      if (this.poseSince == null) this.poseSince = now;
      return false;
    }
    if (this.breakStart == null) this.breakStart = now;
    if (now - this.breakStart <= ALLOWED_BREAK_MS) return true;
    this.stablePose = rawPose;
    this.poseSince = now;
    this.breakStart = null;
    return false;
  }

  private buildHint(
    pose: CoordinationPose,
    expected: CoordinationPose | null,
    beatActive: boolean,
  ): string {
    if (!expected) return 'Great coordination!';
    if (beatActive) return `Switch to ${poseLabel(expected)} on the beat`;
    if (pose === expected) return 'Hold steady…';
    return `Move lips toward ${poseLabel(expected)}`;
  }

  consumeSuccess(): boolean {
    if (this.state !== 'SUCCESS' && this.state !== 'REWARDING') return false;
    this.sequenceTracker.reset();
    this.coordinationScore = 0;
    this.state = 'COORDINATING';
    return true;
  }

  showHelp() {
    this.state = 'HELPING';
  }

  resume() {
    this.state = 'COORDINATING';
  }
}

export function poseLabel(pose: CoordinationPose): string {
  switch (pose) {
    case 'CLOSED':
      return 'closed lips';
    case 'ROUNDED':
      return 'O shape';
    case 'SPREAD':
      return 'smile / E';
    default:
      return 'neutral';
  }
}

export function poseEmoji(pose: CoordinationPose): string {
  switch (pose) {
    case 'CLOSED':
      return '😐';
    case 'ROUNDED':
      return '😮';
    case 'SPREAD':
      return '😁';
    default:
      return '🙂';
  }
}
