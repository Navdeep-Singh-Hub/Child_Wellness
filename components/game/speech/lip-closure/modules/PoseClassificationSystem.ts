/** Three-state lip pose classification with smoothing + hysteresis. */

export type LipPose = 'ROUNDED' | 'SPREAD' | 'NEUTRAL';

const DEFAULT_WINDOW = 5;
export const ROUNDED_THRESHOLD = 0.55;
export const ROUNDED_RELEASE = 0.45;
export const SPREAD_THRESHOLD = 3.5;
export const SPREAD_RELEASE = 2.8;

export class PoseClassificationSystem {
  private readonly roundBuf: number[] = [];
  private readonly spreadBuf: number[] = [];
  private pose: LipPose = 'NEUTRAL';

  reset() {
    this.roundBuf.length = 0;
    this.spreadBuf.length = 0;
    this.pose = 'NEUTRAL';
  }

  push(roundnessRatio: number, spreadRatio: number): { pose: LipPose; smoothedRound: number; smoothedSpread: number } {
    this.roundBuf.push(roundnessRatio);
    this.spreadBuf.push(spreadRatio);
    if (this.roundBuf.length > DEFAULT_WINDOW) this.roundBuf.shift();
    if (this.spreadBuf.length > DEFAULT_WINDOW) this.spreadBuf.shift();

    const smoothedRound =
      this.roundBuf.reduce((a, b) => a + b, 0) / Math.max(1, this.roundBuf.length);
    const smoothedSpread =
      this.spreadBuf.reduce((a, b) => a + b, 0) / Math.max(1, this.spreadBuf.length);

    if (smoothedRound > ROUNDED_THRESHOLD) {
      this.pose = 'ROUNDED';
    } else if (this.pose === 'ROUNDED' && smoothedRound > ROUNDED_RELEASE) {
      /* hysteresis hold */
    } else if (smoothedSpread > SPREAD_THRESHOLD) {
      this.pose = 'SPREAD';
    } else if (this.pose === 'SPREAD' && smoothedSpread > SPREAD_RELEASE) {
      /* hysteresis hold */
    } else {
      this.pose = 'NEUTRAL';
    }

    return { pose: this.pose, smoothedRound, smoothedSpread };
  }

  get current() {
    return this.pose;
  }
}
