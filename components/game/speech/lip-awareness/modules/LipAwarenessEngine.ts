import type {
  LipAwarenessSnapshot,
  LipAwarenessState,
  LipDifficulty,
  LipPose,
} from './lipAwarenessTypes';
import { LIP_POSE_LABEL } from './lipAwarenessTypes';

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

/** Playful lip awareness — watch, tap, copy. No detection; rewards any interaction. */
export class LipAwarenessEngine {
  private state: LipAwarenessState = 'IDLE';
  private difficulty: LipDifficulty = 'easy';
  private prompt: LipPose = 'smile-big';
  private interactionCount = 0;
  private showEnd = 0;
  private rewardEnd = 0;
  private waitStart = 0;
  private helpShown = false;
  private interactionPulse = false;
  private rewardState = false;
  private pacingMs = 2400;

  configure(difficulty: LipDifficulty) {
    this.difficulty = difficulty;
    this.applyPacing();
  }

  reset() {
    this.state = 'IDLE';
    this.interactionCount = 0;
    this.interactionPulse = false;
    this.helpShown = false;
    this.rewardState = false;
    this.applyPacing();
  }

  private applyPacing() {
    this.pacingMs =
      this.difficulty === 'easy' ? 2600 : this.difficulty === 'hard' ? 1600 : 2000;
  }

  lowerDifficulty() {
    this.difficulty = 'easy';
    this.applyPacing();
  }

  beginPrompt(pose: LipPose, now = Date.now()) {
    this.prompt = pose;
    this.state = 'SHOWING_ANIMATION';
    this.interactionPulse = false;
    this.helpShown = false;
    this.showEnd = now + this.pacingMs;
    this.waitStart = 0;
  }

  /** Tap / exploration — immediate reward */
  registerTap(now = Date.now()) {
    this.interactionCount += 1;
    this.interactionPulse = true;
    this.rewardState = true;
    this.state = 'REWARDING';
    this.rewardEnd = now + 750;
    return this.getSnapshot(now);
  }

  confirmInteraction(now = Date.now()): LipAwarenessSnapshot {
    if (this.state !== 'WAITING_FOR_INTERACTION' && this.state !== 'HELPING') {
      return this.getSnapshot(now);
    }
    this.interactionCount += 1;
    this.interactionPulse = true;
    this.rewardState = true;
    this.state = 'REWARDING';
    this.rewardEnd = now + 850;
    return this.getSnapshot(now);
  }

  tick(now = Date.now()): LipAwarenessSnapshot {
    if (this.state === 'SHOWING_ANIMATION' && now >= this.showEnd) {
      this.state = 'WAITING_FOR_INTERACTION';
      this.waitStart = now;
    }

    if (this.state === 'WAITING_FOR_INTERACTION') {
      const helpAfter = this.difficulty === 'easy' ? 15000 : 11000;
      if (!this.helpShown && now - this.waitStart >= helpAfter) {
        this.state = 'HELPING';
        this.helpShown = true;
      }
    }

    if (this.state === 'REWARDING' && now >= this.rewardEnd) {
      this.state = 'IDLE';
      this.rewardState = false;
    }

    return this.getSnapshot(now);
  }

  consumeInteractionPulse(): boolean {
    if (!this.interactionPulse) return false;
    this.interactionPulse = false;
    return true;
  }

  getSnapshot(now = Date.now()): LipAwarenessSnapshot {
    const progress =
      this.state === 'SHOWING_ANIMATION' && this.showEnd > 0
        ? clamp01(1 - (this.showEnd - now) / this.pacingMs)
        : this.state === 'REWARDING'
          ? 1
          : this.state === 'WAITING_FOR_INTERACTION' || this.state === 'HELPING'
            ? 0.5
            : 0;

    return {
      state: this.state,
      lipPrompt: this.prompt,
      promptLabel: LIP_POSE_LABEL[this.prompt],
      gameProgress: progress,
      interactionCount: this.interactionCount,
      rewardState: this.rewardState,
      interactionPulse: this.interactionPulse,
      showHelper: this.state === 'HELPING',
      engagementLevel: clamp01(this.interactionCount / 9),
    };
  }
}
