import { AirflowEngine } from './AirflowEngine';
import { LipPostureEngine, type ResistancePose } from './LipPostureEngine';
import type {
  LipAirflowGameState,
  LipAirflowSnapshot,
  RequiredAirflowPose,
} from './lipAirflowTypes';

export function poseCoordinationScore(pose: ResistancePose): number {
  switch (pose) {
    case 'ROUNDED':
      return 1;
    case 'SPREAD':
      return 0.65;
    case 'NEUTRAL':
      return 0.5;
    case 'CLOSED':
      return 0.18;
    default:
      return 0.4;
  }
}

/**
 * Validates lip posture + sustained soft airflow. High tolerance, no harsh fail.
 */
export class LipAirflowCoordinator {
  readonly postureEngine = new LipPostureEngine();
  readonly airflowEngine = new AirflowEngine();

  state: LipAirflowGameState = 'IDLE';
  requiredPose: RequiredAirflowPose = 'ANY';
  targetMs = 3000;
  accumulatedMs = 0;
  attemptCount = 0;
  fatigueIndicators = 0;

  reset() {
    this.postureEngine.reset();
    this.airflowEngine.reset();
    this.state = 'IDLE';
    this.accumulatedMs = 0;
  }

  startSession(requiredPose: RequiredAirflowPose = 'ANY', targetMs = 3000) {
    this.requiredPose = requiredPose;
    this.targetMs = targetMs;
    this.accumulatedMs = 0;
    this.attemptCount += 1;
    this.state =
      requiredPose === 'ROUNDED' ? 'WAITING_FOR_LIP_POSTURE' : 'WAITING_FOR_AIRFLOW';
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
  ): LipAirflowSnapshot {
    const posture = this.postureEngine.process(
      lipGap,
      roundness,
      spread,
      mouthWidth,
      mouthHeight,
    );
    const lipPose = poseOverride ?? posture.lipPose;
    const confidence = poseOverride ? 0.85 : posture.confidence;
    const unstable = poseOverride ? false : posture.unstable;
    const outWidth = poseOverride ? mouthWidth ?? 0 : posture.mouthWidth;
    const outHeight = poseOverride ? mouthHeight ?? 0 : posture.mouthHeight;
    const airflow = this.airflowEngine.push(audioLevel, now);

    let coordinationScore = 0;
    if (airflow.airflowActive) {
      coordinationScore =
        poseCoordinationScore(lipPose) * airflow.airflowStrength * airflow.airflowStability;
      if (airflow.isShout) coordinationScore *= 0.3;
    }

    this.tickState(lipPose, airflow, coordinationScore, deltaMs);

    const helpfulHint = this.buildHint(lipPose, airflow, coordinationScore);

    return {
      lipPose,
      mouthWidth: outWidth,
      mouthHeight: outHeight,
      airflowStrength: airflow.airflowStrength,
      airflowStability: airflow.airflowStability,
      airflowDuration: airflow.airflowDuration,
      airflowActive: airflow.airflowActive,
      isShout: airflow.isShout,
      coordinationScore,
      accumulatedMs: this.accumulatedMs,
      state: this.state,
      confidence,
      unstable,
      helpfulHint,
    };
  }

  private tickState(
    lipPose: ResistancePose,
    airflow: ReturnType<AirflowEngine['push']>,
    coordinationScore: number,
    deltaMs: number,
  ) {
    if (this.state === 'PAUSED' || this.state === 'IDLE') return;

    const poseOk =
      this.requiredPose === 'ANY' ||
      lipPose === 'ROUNDED' ||
      (lipPose === 'NEUTRAL' && coordinationScore > 0.2);

    if (this.state === 'WAITING_FOR_LIP_POSTURE') {
      if (poseOk) this.state = 'WAITING_FOR_AIRFLOW';
      return;
    }

    if (this.state === 'WAITING_FOR_AIRFLOW') {
      if (airflow.airflowActive && coordinationScore > 0.08) {
        this.state = 'COORDINATING';
      }
      return;
    }

    if (this.state === 'COORDINATING') {
      if (coordinationScore > 0.1) {
        this.accumulatedMs += coordinationScore * deltaMs;
      } else if (!airflow.airflowActive) {
        this.fatigueIndicators += 1;
      }

      if (this.accumulatedMs >= this.targetMs) {
        this.state = 'SUCCESS';
      }
      return;
    }

    if (this.state === 'SUCCESS' || this.state === 'REWARDING') {
      return;
    }
  }

  private buildHint(
    lipPose: ResistancePose,
    airflow: ReturnType<AirflowEngine['push']>,
    coordinationScore: number,
  ): string {
    if (airflow.isShout) return 'Blow more gently';
    if (this.requiredPose === 'ROUNDED' && lipPose !== 'ROUNDED' && lipPose !== 'NEUTRAL') {
      return 'Round your lips softly';
    }
    if (lipPose === 'CLOSED' && airflow.airflowActive) return 'Open lips a little to let air flow';
    if (!airflow.airflowActive) return 'Blow gently';
    if (coordinationScore > 0.35) return 'Nice steady airflow!';
    return 'Keep blowing softly';
  }

  consumeSuccess(): number | null {
    if (this.state !== 'SUCCESS' && this.state !== 'REWARDING') return null;
    const ms = this.accumulatedMs;
    this.accumulatedMs = 0;
    this.state = this.requiredPose === 'ROUNDED' ? 'WAITING_FOR_LIP_POSTURE' : 'WAITING_FOR_AIRFLOW';
    return ms;
  }

  showHelp() {
    this.state = 'HELPING';
  }

  resume() {
    this.state =
      this.requiredPose === 'ROUNDED' ? 'WAITING_FOR_LIP_POSTURE' : 'WAITING_FOR_AIRFLOW';
  }
}
