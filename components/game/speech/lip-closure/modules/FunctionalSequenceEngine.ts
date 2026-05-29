import { AirflowEngine } from './AirflowEngine';
import { AudioBurstEngine } from './AudioBurstEngine';
import { FunctionalSequenceTracker } from './FunctionalSequenceTracker';
import { LipPostureEngine } from './LipPostureEngine';
import type {
  FunctionalSequenceGameState,
  FunctionalSequenceSnapshot,
  FunctionalSequenceStep,
} from './functionalSequenceTypes';
import type { ResistancePose } from './ResistancePoseSystem';

export const ALLOWED_BREAK_MS = 600;

function stepLabel(step: FunctionalSequenceStep | null): string {
  if (!step) return 'Path complete!';
  switch (step.state) {
    case 'CLOSED':
      return 'Close lips';
    case 'ROUNDED':
      return 'Round lips — O shape';
    case 'SPREAD':
      return 'Spread lips — smile';
    case 'NEUTRAL':
      return 'Relax mouth';
    case 'BURST':
      return 'Close lips, then burst sound';
    case 'AIRFLOW':
      return 'Gentle steady airflow';
    default:
      return 'Follow the mouth path';
  }
}

/**
 * Integrates posture, bilabial burst, and airflow into functional pre-speech sequences.
 */
export class FunctionalSequenceEngine {
  readonly postureEngine = new LipPostureEngine();
  readonly audioEngine = new AudioBurstEngine(350);
  readonly airflowEngine = new AirflowEngine();
  tracker = new FunctionalSequenceTracker([]);

  state: FunctionalSequenceGameState = 'IDLE';
  attemptCount = 0;
  fatigueIndicators = 0;
  transitionSmoothness = 0.5;
  coordinationScore = 0;
  private stablePose: ResistancePose = 'NEUTRAL';
  private poseSince: number | null = null;
  private breakStart: number | null = null;
  private prevPose: ResistancePose = 'NEUTRAL';
  private smoothTransitions = 0;
  private totalTransitions = 0;

  reset() {
    this.postureEngine.reset();
    this.audioEngine.reset();
    this.airflowEngine.reset();
    this.tracker = new FunctionalSequenceTracker([]);
    this.state = 'IDLE';
    this.transitionSmoothness = 0.5;
    this.coordinationScore = 0;
    this.stablePose = 'NEUTRAL';
    this.poseSince = null;
    this.breakStart = null;
    this.prevPose = 'NEUTRAL';
    this.smoothTransitions = 0;
    this.totalTransitions = 0;
  }

  setSteps(steps: FunctionalSequenceStep[]) {
    this.tracker = new FunctionalSequenceTracker(steps);
  }

  startSession(steps: FunctionalSequenceStep[]) {
    this.setSteps(steps);
    this.attemptCount += 1;
    this.state = 'DETECTING';
  }

  process(
    lipGap: number | null,
    roundness: number | null,
    spread: number | null,
    mouthWidth: number | null,
    mouthHeight: number | null,
    audioLevel: number,
    poseOverride: ResistancePose | null,
    now = Date.now(),
    deltaMs = 50,
  ): FunctionalSequenceSnapshot {
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
    const poseConfirmed = poseHoldMs >= 300 && lipPose === this.stablePose;
    const lipsClosed = lipPose === 'CLOSED' || (lipGap != null && lipGap < 10);

    const { audioSpike } = this.audioEngine.push(audioLevel, now);
    const airflow = this.airflowEngine.push(audioLevel, now);

    if (rawPose !== this.prevPose && !inGracePeriod) {
      this.totalTransitions += 1;
      if (poseHoldMs >= 200 || this.totalTransitions <= 1) {
        this.smoothTransitions += 1;
      }
      this.prevPose = rawPose;
    }
    this.transitionSmoothness =
      this.totalTransitions > 0 ? this.smoothTransitions / this.totalTransitions : 0.5;

    if (this.state === 'DETECTING' && poseConfirmed) {
      this.state = 'SEQUENCING';
    }

    if (this.state === 'SEQUENCING' || this.state === 'WAITING_FOR_STEP') {
      this.state = 'WAITING_FOR_STEP';
      const advanced = this.tracker.tick(
        lipPose,
        poseHoldMs,
        lipsClosed,
        audioSpike,
        airflow.airflowActive,
        now,
        deltaMs,
      );
      if (advanced) {
        this.coordinationScore = Math.min(1, this.tracker.progress);
        this.transitionSmoothness = Math.min(1, this.transitionSmoothness + 0.05);
      }
      if (this.tracker.complete) {
        this.state = 'SUCCESS';
      }
    }

    const helpfulHint = stepLabel(this.tracker.current);

    return {
      lipPose,
      poseHoldMs,
      poseConfirmed,
      lipsClosed,
      audioLevel,
      audioSpike,
      airflowActive: airflow.airflowActive,
      airflowStrength: airflow.airflowStrength,
      sequenceProgress: this.tracker.progress,
      currentStep: this.tracker.current,
      state: this.state,
      confidence: poseOverride ? 0.85 : posture.confidence,
      unstable: poseOverride ? false : posture.unstable,
      inGracePeriod,
      helpfulHint,
      transitionSmoothness: this.transitionSmoothness,
    };
  }

  private updateStablePose(rawPose: ResistancePose, now: number): boolean {
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

  consumeSuccess(): boolean {
    if (this.state !== 'SUCCESS' && this.state !== 'REWARDING') return false;
    this.tracker.reset();
    this.coordinationScore = 0;
    this.state = 'SEQUENCING';
    return true;
  }

  showHelp() {
    this.state = 'HELPING';
  }

  resume() {
    this.state = 'SEQUENCING';
  }
}

export function poseEmoji(pose: ResistancePose | string): string {
  switch (pose) {
    case 'CLOSED':
      return '😐';
    case 'ROUNDED':
      return '😮';
    case 'SPREAD':
      return '😁';
    case 'BURST':
      return '💥';
    case 'AIRFLOW':
      return '💨';
    default:
      return '🙂';
  }
}

export function stepEmoji(step: FunctionalSequenceStep | null): string {
  if (!step) return '⭐';
  return poseEmoji(step.state);
}
