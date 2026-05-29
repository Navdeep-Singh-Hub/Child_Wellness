import type {
  OralToleranceAnalytics,
  OralToleranceDifficulty,
  OralToleranceGameId,
  OralToleranceRewardState,
  OralToleranceSnapshot,
  OralToleranceState,
} from './oralSensoryTypes';

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * Participation-only engine for oral sensory tolerance.
 * No correctness, no timers, no pressure. Watching counts.
 */
export class OralSensoryToleranceEngine {
  readonly gameId: OralToleranceGameId;

  private state: OralToleranceState = 'IDLE';
  private difficulty: OralToleranceDifficulty = 'easy';

  private startMs = Date.now();
  private lastMs = Date.now();
  private lastInteractionMs = 0;

  private engagement = 0.15;
  private comfort = 0.55;
  private sensoryIntensity = 0.55;
  private interactionCount = 0;

  private rewardState: OralToleranceRewardState = 'NONE';
  private rewardPulse = false;
  private rewardCount = 0;

  // overwhelm detection (very gentle)
  private rapidTapStreak = 0;
  private overwhelmEvents = 0;

  private comfortSum = 0;
  private comfortMin = 1;
  private comfortSamples = 0;

  constructor(gameId: OralToleranceGameId) {
    this.gameId = gameId;
  }

  configure(difficulty: OralToleranceDifficulty) {
    this.difficulty = difficulty;
  }

  reset() {
    this.state = 'IDLE';
    this.startMs = Date.now();
    this.lastMs = this.startMs;
    this.lastInteractionMs = 0;
    this.engagement = 0.15;
    this.comfort = 0.55;
    this.sensoryIntensity = 0.55;
    this.interactionCount = 0;
    this.rewardState = 'NONE';
    this.rewardPulse = false;
    this.rewardCount = 0;
    this.rapidTapStreak = 0;
    this.overwhelmEvents = 0;
    this.comfortSum = 0;
    this.comfortMin = 1;
    this.comfortSamples = 0;
  }

  setPaused(paused: boolean) {
    if (paused) this.state = 'PAUSED';
    else if (this.state === 'PAUSED') this.state = 'EXPLORING';
  }

  /** Child taps / interacts; intensity is 0..1 based on gesture size/speed */
  recordInteraction(intensity = 0.35, now = Date.now()) {
    this.lastInteractionMs = now;
    this.interactionCount += 1;
    this.state = this.state === 'IDLE' ? 'EXPLORING' : 'INTERACTING';

    // engagement grows quickly early, then slows
    const engageBoost = lerp(0.06, 0.015, this.engagement);
    this.engagement = clamp01(this.engagement + engageBoost);

    // comfort: gentle interactions raise it; frantic intensity reduces a bit
    const gentle = intensity <= 0.55 ? 1 : 0;
    const comfortUp = gentle ? 0.03 : 0.008;
    const comfortDown = intensity >= 0.8 ? 0.03 : intensity >= 0.65 ? 0.015 : 0;
    this.comfort = clamp01(this.comfort + comfortUp - comfortDown);

    // detect overwhelm via rapid taps (very tolerant)
    const dt = now - (this.lastMs ?? now);
    if (dt < 220) this.rapidTapStreak += 1;
    else this.rapidTapStreak = Math.max(0, this.rapidTapStreak - 1);

    if (this.rapidTapStreak >= 7) {
      this.overwhelmEvents += 1;
      this.rapidTapStreak = 0;
      // reduce sensory load
      this.sensoryIntensity = clamp01(this.sensoryIntensity * 0.8);
      this.state = 'HELPING';
    } else {
      // when comfortable, allow slightly richer motion
      const targetIntensity = this.comfort >= 0.7 ? 0.7 : this.comfort >= 0.6 ? 0.62 : 0.55;
      this.sensoryIntensity = lerp(this.sensoryIntensity, targetIntensity, 0.25);
    }

    // reward pulse every 2–4 interactions depending on difficulty, also for first interaction
    const cadence = this.difficulty === 'easy' ? 2 : this.difficulty === 'hard' ? 4 : 3;
    if (this.interactionCount === 1 || this.interactionCount % cadence === 0) {
      this.triggerReward('SPARKLE');
    }
  }

  /** Watching / idle time still counts toward engagement & comfort */
  tick(now = Date.now()): OralToleranceSnapshot {
    const dt = Math.max(0, now - this.lastMs);
    this.lastMs = now;

    if (this.state === 'IDLE') this.state = 'EXPLORING';

    if (this.state !== 'PAUSED') {
      // passive engagement slowly rises
      const passiveGain = this.engagement < 0.55 ? 0.00022 : 0.00012;
      this.engagement = clamp01(this.engagement + passiveGain * dt);

      // comfort trends up slowly if no recent overwhelm / frantic tapping
      const sinceInteraction = now - this.lastInteractionMs;
      const calmWindow = sinceInteraction > 1500 ? 1 : 0;
      const comfortPassive = calmWindow ? 0.00018 : 0.00006;
      this.comfort = clamp01(this.comfort + comfortPassive * dt);

      // if helping, ease back to exploring
      if (this.state === 'HELPING' && sinceInteraction > 1200) {
        this.state = 'EXPLORING';
      }

      // reward state decay
      if (this.rewardState !== 'NONE' && sinceInteraction > 900) {
        this.rewardState = 'NONE';
      }
    }

    this.comfortSum += this.comfort;
    this.comfortSamples += 1;
    this.comfortMin = Math.min(this.comfortMin, this.comfort);

    return {
      state: this.state,
      engagementLevel: this.engagement,
      interactionCount: this.interactionCount,
      comfortLevel: this.comfort,
      rewardState: this.rewardState,
      rewardPulse: this.rewardPulse,
      sensoryIntensity: this.sensoryIntensity,
      engagementTimeMs: now - this.startMs,
    };
  }

  triggerReward(reward: OralToleranceRewardState) {
    this.rewardState = reward;
    this.rewardPulse = true;
    this.rewardCount += 1;
    this.state = 'REWARDING';
  }

  consumeRewardPulse() {
    if (!this.rewardPulse) return false;
    this.rewardPulse = false;
    if (this.state === 'REWARDING') this.state = 'EXPLORING';
    return true;
  }

  lowerSensoryLoad() {
    this.sensoryIntensity = clamp01(this.sensoryIntensity * 0.75);
    this.comfort = clamp01(this.comfort + 0.03);
    this.state = 'HELPING';
  }

  getAnalytics(): OralToleranceAnalytics {
    const avgComfort = this.comfortSamples ? this.comfortSum / this.comfortSamples : this.comfort;
    return {
      engagementTimeMs: Date.now() - this.startMs,
      interactionCount: this.interactionCount,
      comfortAverage: avgComfort,
      comfortMin: this.comfortMin === 1 ? this.comfort : this.comfortMin,
      rewardCount: this.rewardCount,
      overwhelmEvents: this.overwhelmEvents,
      lastUpdated: Date.now(),
    };
  }
}

