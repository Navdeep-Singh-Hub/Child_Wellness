import type {
  MotorSpeechTimingAnalytics,
  MotorSpeechTimingDifficulty,
  MotorSpeechTimingGameId,
  MotorSpeechTimingRewardState,
  MotorSpeechTimingSnapshot,
  MouthPosture,
  RhythmBeat,
} from './motorSpeechTimingTypes';

const CORE_RHYTHMS: RhythmBeat[] = ['ma_pause_ma', 'pa_pause_pa', 'aaa_pause_aaa'];
const EXTENDED_RHYTHMS: RhythmBeat[] = ['ma_pause_ma', 'pa_pause_pa', 'aaa_pause_aaa', 'oo_pause_oo'];

export function rhythmToLabel(beat: RhythmBeat): string {
  switch (beat) {
    case 'ma_pause_ma':
      return 'MA … MA';
    case 'pa_pause_pa':
      return 'PA … PA';
    case 'aaa_pause_aaa':
      return 'AAA … AAA';
    case 'oo_pause_oo':
      return 'OO … OO';
    default:
      return 'Watch';
  }
}

export function rhythmToPostureHint(beat: RhythmBeat): MouthPosture | null {
  switch (beat) {
    case 'ma_pause_ma':
    case 'pa_pause_pa':
      return 'CLOSED';
    case 'aaa_pause_aaa':
      return 'OPEN';
    case 'oo_pause_oo':
      return 'ROUNDED';
    default:
      return null;
  }
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function beatIntervalMs(difficulty: MotorSpeechTimingDifficulty) {
  if (difficulty === 'easy') return 1400;
  if (difficulty === 'medium') return 1100;
  return 900;
}

/**
 * Motor speech timing / rhythm — no STT, no phoneme scoring.
 * Any tap, mouth movement, hum, or optional vocal on beat counts.
 */
export class MotorSpeechTimingEngine {
  readonly gameId: MotorSpeechTimingGameId;
  private difficulty: MotorSpeechTimingDifficulty = 'easy';

  private startMs = Date.now();
  private lastMs = this.startMs;
  private lastInteractionMs = this.startMs;
  private lastBeatMs = 0;
  private rhythmActiveUntilMs = 0;

  private timingAttempts = 0;
  private vocalAttempts = 0;
  private rhythmParticipation = 0.2;
  private sequenceProgress = 0;
  private engagement = 0.2;

  private rewardState: MotorSpeechTimingRewardState = 'NONE';
  private rewardPulse = false;
  private rhythmPulse = false;
  private helperVisible = false;
  private promptRhythm: RhythmBeat = 'watch';
  private state: MotorSpeechTimingSnapshot['state'] = 'IDLE';
  private helperCount = 0;
  private rhythmExposure: string[] = [];

  constructor(gameId: MotorSpeechTimingGameId) {
    this.gameId = gameId;
  }

  configure(difficulty: MotorSpeechTimingDifficulty) {
    this.difficulty = difficulty;
  }

  reset() {
    const now = Date.now();
    this.startMs = now;
    this.lastMs = now;
    this.lastInteractionMs = now;
    this.lastBeatMs = now;
    this.rhythmActiveUntilMs = 0;
    this.timingAttempts = 0;
    this.vocalAttempts = 0;
    this.rhythmParticipation = 0.2;
    this.sequenceProgress = 0;
    this.engagement = 0.2;
    this.rewardState = 'NONE';
    this.rewardPulse = false;
    this.rhythmPulse = false;
    this.helperVisible = false;
    this.promptRhythm = 'watch';
    this.state = 'IDLE';
    this.helperCount = 0;
    this.rhythmExposure = [];
  }

  setPaused(paused: boolean) {
    this.state = paused ? 'PAUSED' : 'SHOWING_PROMPT';
  }

  private rhythmsForDifficulty(): RhythmBeat[] {
    return this.difficulty === 'easy' ? CORE_RHYTHMS : EXTENDED_RHYTHMS;
  }

  showPrompt(rhythm?: RhythmBeat) {
    const pool = this.rhythmsForDifficulty();
    this.promptRhythm = rhythm ?? pool[this.timingAttempts % pool.length] ?? pool[0] ?? 'ma_pause_ma';
    this.state = 'SHOWING_PROMPT';
    this.helperVisible = false;
    this.lastBeatMs = Date.now();
  }

  attempt(opts?: { withVocal?: boolean; rhythm?: RhythmBeat }) {
    const now = Date.now();
    this.timingAttempts += 1;
    this.lastInteractionMs = now;
    this.helperVisible = false;
    if (opts?.withVocal) this.vocalAttempts += 1;

    const exposure = opts?.rhythm ?? this.promptRhythm;
    if (exposure !== 'watch' && !this.rhythmExposure.includes(exposure)) {
      this.rhythmExposure = [...this.rhythmExposure, exposure];
    }

    const pool = this.rhythmsForDifficulty();
    this.sequenceProgress = clamp01(this.sequenceProgress + 1 / Math.max(3, pool.length));
    this.rhythmParticipation = clamp01(
      this.rhythmParticipation + 0.08 + (opts?.withVocal ? 0.1 : 0.05),
    );
    this.engagement = clamp01(this.engagement + 0.07);

    this.promptRhythm = pool[this.timingAttempts % pool.length] ?? 'ma_pause_ma';

    const rewardEvery = this.difficulty === 'easy' ? 1 : this.difficulty === 'medium' ? 2 : 3;
    if (this.timingAttempts % rewardEvery === 0) {
      this.triggerReward(
        this.sequenceProgress >= 0.88 ? 'HERO' : this.sequenceProgress >= 0.5 ? 'STAR' : 'SPARKLE',
      );
    }

    this.state = 'WAITING_FOR_ATTEMPT';
  }

  triggerReward(kind: MotorSpeechTimingRewardState) {
    this.rewardState = kind;
    this.rewardPulse = true;
    this.state = 'REWARDING';
  }

  consumeRewardPulse() {
    if (!this.rewardPulse) return false;
    this.rewardPulse = false;
    if (this.state === 'REWARDING') this.state = 'WAITING_FOR_ATTEMPT';
    return true;
  }

  showHelper() {
    this.helperVisible = true;
    this.helperCount += 1;
    this.state = 'HELPING';
  }

  private updateRhythmBeat(now: number) {
    if (this.state === 'PAUSED' || this.state === 'REWARDING') return;

    const interval = beatIntervalMs(this.difficulty);
    if (now - this.lastBeatMs >= interval) {
      this.lastBeatMs = now;
      this.rhythmPulse = true;
      this.rhythmActiveUntilMs = now + 280;
      if (this.state !== 'HELPING') this.state = 'RHYTHM_ACTIVE';
    }

    if (this.rhythmPulse && now > this.rhythmActiveUntilMs) {
      this.rhythmPulse = false;
      if (this.state === 'RHYTHM_ACTIVE') {
        this.state = 'WAITING_FOR_ATTEMPT';
      }
    }
  }

  tick(now = Date.now()): MotorSpeechTimingSnapshot {
    const dt = Math.max(0, now - this.lastMs);
    this.lastMs = now;

    if (this.state === 'IDLE') this.state = 'SHOWING_PROMPT';

    if (this.state !== 'PAUSED') {
      this.updateRhythmBeat(now);
      this.engagement = clamp01(this.engagement + dt * 0.0001);

      const idleMs = now - this.lastInteractionMs;
      const helperDelay =
        this.difficulty === 'easy' ? 4200 : this.difficulty === 'medium' ? 4600 : 5000;
      if (idleMs > helperDelay && !this.helperVisible && this.state !== 'RHYTHM_ACTIVE') {
        this.showHelper();
      }

      if (this.helperVisible && idleMs < 900) {
        this.helperVisible = false;
        if (this.state === 'HELPING') this.state = 'WAITING_FOR_ATTEMPT';
      }
    }

    return {
      state: this.state,
      currentRhythm: this.promptRhythm,
      rhythmParticipation: this.rhythmParticipation,
      timingAttempt: this.timingAttempts,
      vocalAttempt: this.vocalAttempts,
      sequenceProgress: this.sequenceProgress,
      engagementLevel: this.engagement,
      rewardState: this.rewardState,
      rewardPulse: this.rewardPulse,
      rhythmPulse: this.rhythmPulse,
      postureHint: rhythmToPostureHint(this.promptRhythm),
      helperVisible: this.helperVisible,
      engagementTimeMs: now - this.startMs,
      rhythmExposure: [...this.rhythmExposure],
    };
  }

  getAnalytics(completedGames = 0): MotorSpeechTimingAnalytics {
    return {
      engagementTimeMs: Date.now() - this.startMs,
      vocalAttempts: this.vocalAttempts,
      rhythmAttempts: this.timingAttempts,
      sequenceProgress: this.sequenceProgress,
      rhythmExposure: [...this.rhythmExposure],
      completedGames,
      helperCount: this.helperCount,
      lastUpdated: Date.now(),
    };
  }
}
