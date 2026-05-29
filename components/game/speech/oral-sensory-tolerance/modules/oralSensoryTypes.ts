export type OralToleranceState =
  | 'IDLE'
  | 'EXPLORING'
  | 'INTERACTING'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type OralToleranceRewardState = 'NONE' | 'SPARKLE' | 'SMILE' | 'HUG' | 'CALM_CELEBRATION';

export type OralToleranceSnapshot = {
  state: OralToleranceState;
  /** 0..1: passive watching and calm touches increase this */
  engagementLevel: number;
  interactionCount: number;
  /** 0..1: comfort grows with gentle interactions; drops slightly with frantic tapping */
  comfortLevel: number;
  rewardState: OralToleranceRewardState;
  /** true when a reward pulse should be consumed by the game */
  rewardPulse: boolean;
  /** movement intensity multiplier, lower = calmer */
  sensoryIntensity: number;
  /** ms since session start */
  engagementTimeMs: number;
};

export type OralToleranceDifficulty = 'easy' | 'medium' | 'hard';

export type OralToleranceGameId =
  | 'magic-face-breeze'
  | 'bubble-nose-tickles'
  | 'funny-mouth-explorer'
  | 'soft-sensory-monster'
  | 'calm-mouth-adventure';

export type OralToleranceAnalytics = {
  engagementTimeMs: number;
  interactionCount: number;
  comfortAverage: number;
  comfortMin: number;
  rewardCount: number;
  overwhelmEvents: number;
  lastUpdated: number;
};

