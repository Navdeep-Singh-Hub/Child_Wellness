export type TongueLipCoordinationState =
  | 'IDLE'
  | 'SHOWING_PROMPT'
  | 'WAITING_FOR_ATTEMPT'
  | 'COORDINATION_ACTIVE'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type LipApproximation =
  | 'OPEN'
  | 'CLOSED'
  | 'ROUNDED'
  | 'SPREAD'
  | 'TONGUE_VISIBLE_APPROX'
  | 'TONGUE_OUT_APPROX';

export type TongueApproximation = 'NONE' | 'TONGUE_VISIBLE_APPROX' | 'TONGUE_OUT_APPROX';

export type TongueLipCoordinationDifficulty = 'easy' | 'medium' | 'hard';

export type TongueLipCoordinationGameId =
  | 'funny-tongue-lips-team'
  | 'monster-mouth-mixup'
  | 'magic-lip-tongue-switch'
  | 'talking-face-coordination'
  | 'tongue-lips-hero';

export type TongueLipRewardState = 'NONE' | 'SPARKLE' | 'STAR' | 'HERO';

export type TongueLipCoordinationSnapshot = {
  state: TongueLipCoordinationState;
  lipApproximation: LipApproximation;
  tongueApproximation: TongueApproximation;
  coordinationAttempt: number;
  imitationAttempt: number;
  sequenceProgress: number;
  engagementLevel: number;
  rewardState: TongueLipRewardState;
  coordinationPulse: boolean;
  helperVisible: boolean;
  engagementTimeMs: number;
  lipHint: string;
  tongueHint: string;
};

export type TongueLipCoordinationAnalytics = {
  engagementTimeMs: number;
  coordinationAttempts: number;
  imitationAttempts: number;
  sequenceProgress: number;
  completedGames: number;
  helperCount: number;
  lastUpdated: number;
};
