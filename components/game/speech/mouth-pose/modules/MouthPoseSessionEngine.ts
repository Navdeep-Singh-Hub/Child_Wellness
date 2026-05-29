import type { MouthPoseGameState } from './mouthPoseTypes';

/** Lightweight FSM for camera-gated prompts (used alongside existing game engines). */
export class MouthPoseSessionEngine {
  private state: MouthPoseGameState = 'IDLE';
  private helpShown = false;
  private waitStart = 0;
  private rewardEnd = 0;

  reset() {
    this.state = 'IDLE';
    this.helpShown = false;
    this.waitStart = 0;
    this.rewardEnd = 0;
  }

  beginDetecting(now = Date.now()) {
    this.state = 'DETECTING';
    this.helpShown = false;
    this.waitStart = now;
  }

  tick(now = Date.now(), helpAfterMs = 12000): MouthPoseGameState {
    if (this.state === 'DETECTING' && !this.helpShown && now - this.waitStart >= helpAfterMs) {
      this.state = 'HELPING';
      this.helpShown = true;
    }
    if (this.state === 'REWARDING' && now >= this.rewardEnd) {
      this.state = 'IDLE';
    }
    return this.state;
  }

  onMatch(now = Date.now()) {
    this.state = 'REWARDING';
    this.rewardEnd = now + 700;
  }

  getState() {
    return this.state;
  }

  isHelping() {
    return this.state === 'HELPING';
  }
}
