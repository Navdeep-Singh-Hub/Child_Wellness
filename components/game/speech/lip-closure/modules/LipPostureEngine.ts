import {
  ResistancePoseSystem,
  type ResistancePose,
} from './ResistancePoseSystem';

export {
  LEFT_LIP_CORNER_INDEX,
  LOWER_LIP_INDEX,
  RIGHT_LIP_CORNER_INDEX,
  UPPER_LIP_INDEX,
  metricsFromLandmarks,
} from './LipResistanceEngine';

/** Four-state lip posture from mouth width/height landmarks. */
export class LipPostureEngine {
  private poseSystem = new ResistancePoseSystem();
  private unstableFrames = 0;

  reset() {
    this.poseSystem.reset();
    this.unstableFrames = 0;
  }

  process(
    lipGap: number | null,
    roundness: number | null,
    spread: number | null,
    mouthWidth: number | null,
    mouthHeight: number | null,
  ) {
    if (
      lipGap == null ||
      roundness == null ||
      spread == null ||
      mouthWidth == null ||
      mouthHeight == null
    ) {
      this.unstableFrames += 1;
      return {
        lipPose: this.poseSystem.current,
        mouthWidth: 0,
        mouthHeight: 0,
        confidence: Math.max(0.2, 1 - this.unstableFrames / 15),
        unstable: true,
      };
    }

    this.unstableFrames = Math.max(0, this.unstableFrames - 1);
    const { pose } = this.poseSystem.push(lipGap, roundness, spread);

    return {
      lipPose: pose,
      mouthWidth,
      mouthHeight,
      confidence: Math.min(1, Math.max(0.35, 1 - this.unstableFrames / 20)),
      unstable: this.unstableFrames > 8,
    };
  }

  get current(): ResistancePose {
    return this.poseSystem.current;
  }
}

export type { ResistancePose };
