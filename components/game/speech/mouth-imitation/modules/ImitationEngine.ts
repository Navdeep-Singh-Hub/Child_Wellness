import type {
  ImitationDifficulty,
  ImitationGameState,
  ImitationSnapshot,
  MouthPose,
} from './imitationTypes';
import { MOUTH_POSE_LABEL } from './imitationTypes';

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

/** Guides watch-and-copy mouth imitation. No detection — rewards any attempt. */
export class ImitationEngine {
  private state: ImitationGameState = 'IDLE';
  private difficulty: ImitationDifficulty = 'easy';
  private prompt: MouthPose = 'open';
  private interactionCount = 0;
  private showEnd = 0;
  private rewardEnd = 0;
  private waitStart = 0;
  private helpShown = false;
  private attemptPulse = false;
  private cyclesInSession = 0;
  private pacingMs = 2200;
  private successState = false;

  configure(difficulty: ImitationDifficulty) {
    this.difficulty = difficulty;
    this.applyPacing();
  }

  reset() {
    this.state = 'IDLE';
    this.interactionCount = 0;
    this.cyclesInSession = 0;
    this.attemptPulse = false;
    this.helpShown = false;
    this.applyPacing();
  }

  private applyPacing() {
    this.pacingMs =
      this.difficulty === 'easy' ? 2400 : this.difficulty === 'hard' ? 1500 : 1900;
  }

  lowerDifficulty() {
    this.difficulty = 'easy';
    this.applyPacing();
  }

  beginPrompt(pose: MouthPose, now = Date.now()) {
    this.prompt = pose;
    this.state = 'SHOWING_ANIMATION';
    this.attemptPulse = false;
    this.helpShown = false;
    this.showEnd = now + this.pacingMs;
    this.waitStart = 0;
  }

  triggerHelp(now = Date.now()) {
    if (this.state === 'WAITING_FOR_IMITATION' || this.state === 'HELPING') {
      this.state = 'HELPING';
      this.helpShown = true;
      this.waitStart = now;
    }
  }

  confirmAttempt(now = Date.now()): ImitationSnapshot {
    if (this.state !== 'WAITING_FOR_IMITATION' && this.state !== 'HELPING') {
      return this.getSnapshot(now);
    }
    this.interactionCount += 1;
    this.cyclesInSession += 1;
    this.attemptPulse = true;
    this.successState = true;
    this.state = 'REWARDING';
    this.rewardEnd = now + 850;
    return this.getSnapshot(now);
  }

  tick(now = Date.now()): ImitationSnapshot {
    if (this.state === 'SHOWING_ANIMATION' && now >= this.showEnd) {
      this.state = 'WAITING_FOR_IMITATION';
      this.waitStart = now;
    }

    if (this.state === 'WAITING_FOR_IMITATION') {
      const helpAfter = this.difficulty === 'easy' ? 14000 : 10000;
      if (!this.helpShown && now - this.waitStart >= helpAfter) {
        this.state = 'HELPING';
        this.helpShown = true;
      }
    }

    if (this.state === 'REWARDING' && now >= this.rewardEnd) {
      this.state = 'IDLE';
      this.successState = false;
    }

    return this.getSnapshot(now);
  }

  consumeAttemptPulse(): boolean {
    if (!this.attemptPulse) return false;
    this.attemptPulse = false;
    return true;
  }

  getSnapshot(now = Date.now()): ImitationSnapshot {
    const progress =
      this.state === 'SHOWING_ANIMATION' && this.showEnd > 0
        ? clamp01(1 - (this.showEnd - now) / this.pacingMs)
        : this.state === 'REWARDING'
          ? 1
          : this.state === 'WAITING_FOR_IMITATION' || this.state === 'HELPING'
            ? 0.5
            : 0;

    return {
      state: this.state,
      imitationPrompt: this.prompt,
      promptLabel: MOUTH_POSE_LABEL[this.prompt],
      successState: this.successState,
      gameProgress: progress,
      interactionCount: this.interactionCount,
      attemptPulse: this.attemptPulse,
      showHelper: this.state === 'HELPING',
      pacingMs: this.pacingMs,
    };
  }

  getInteractionCount() {
    return this.interactionCount;
  }
}
