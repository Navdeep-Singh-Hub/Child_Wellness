/** Four-state lip pose + gap smoothing with hysteresis. */

export type ResistancePose = 'CLOSED' | 'ROUNDED' | 'SPREAD' | 'NEUTRAL';

const WINDOW = 5;
export const CLOSED_THRESHOLD = 7;
export const CLOSED_RELEASE = 10;
export const ROUNDED_THRESHOLD = 0.55;
export const ROUNDED_RELEASE = 0.45;
export const SPREAD_THRESHOLD = 3.5;
export const SPREAD_RELEASE = 2.8;

export class ResistancePoseSystem {
  private gapBuf: number[] = [];
  private roundBuf: number[] = [];
  private spreadBuf: number[] = [];
  private pose: ResistancePose = 'NEUTRAL';
  private lipsClosed = false;

  reset() {
    this.gapBuf.length = 0;
    this.roundBuf.length = 0;
    this.spreadBuf.length = 0;
    this.pose = 'NEUTRAL';
    this.lipsClosed = false;
  }

  push(lipGap: number, roundness: number, spread: number) {
    this.gapBuf.push(lipGap);
    this.roundBuf.push(roundness);
    this.spreadBuf.push(spread);
    if (this.gapBuf.length > WINDOW) this.gapBuf.shift();
    if (this.roundBuf.length > WINDOW) this.roundBuf.shift();
    if (this.spreadBuf.length > WINDOW) this.spreadBuf.shift();

    const smoothedGap = avg(this.gapBuf);
    const smoothedRound = avg(this.roundBuf);
    const smoothedSpread = avg(this.spreadBuf);

    if (smoothedGap < CLOSED_THRESHOLD) {
      this.lipsClosed = true;
    } else if (smoothedGap > CLOSED_RELEASE) {
      this.lipsClosed = false;
    }

    if (this.lipsClosed) {
      this.pose = 'CLOSED';
    } else if (smoothedRound > ROUNDED_THRESHOLD) {
      this.pose = 'ROUNDED';
    } else if (this.pose === 'ROUNDED' && smoothedRound > ROUNDED_RELEASE) {
      /* hysteresis */
    } else if (smoothedSpread > SPREAD_THRESHOLD) {
      this.pose = 'SPREAD';
    } else if (this.pose === 'SPREAD' && smoothedSpread > SPREAD_RELEASE) {
      /* hysteresis */
    } else {
      this.pose = 'NEUTRAL';
    }

    return { pose: this.pose, smoothedGap, smoothedRound, smoothedSpread };
  }

  get current() {
    return this.pose;
  }
}

function avg(buf: number[]) {
  return buf.reduce((a, b) => a + b, 0) / Math.max(1, buf.length);
}
