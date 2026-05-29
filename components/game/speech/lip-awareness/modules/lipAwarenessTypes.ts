/** Level 5 Session 4 — Lip Awareness & Lip Sensory Mapping (no camera) */

export type LipAwarenessState =
  | 'IDLE'
  | 'SHOWING_ANIMATION'
  | 'WAITING_FOR_INTERACTION'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type LipPose = 'smile-big' | 'smile-small' | 'closed' | 'funny' | 'round' | 'kiss';

export type LipDifficulty = 'easy' | 'medium' | 'hard';

export type LipAwarenessGameId =
  | 'happy-lips-mirror'
  | 'lip-tap-friend'
  | 'magic-lip-glow'
  | 'funny-fish-lips'
  | 'lip-explorer-adventure';

export interface LipAwarenessSnapshot {
  state: LipAwarenessState;
  lipPrompt: LipPose;
  promptLabel: string;
  gameProgress: number;
  interactionCount: number;
  rewardState: boolean;
  interactionPulse: boolean;
  showHelper: boolean;
  engagementLevel: number;
}

export interface LipAwarenessAnalyticsRecord {
  interactionCount: number;
  engagementTimeMs: number;
  gameCompletion: number;
  playPatterns: string[];
  lastUpdated: number;
}

export const LIP_POSE_FACE: Record<LipPose, string> = {
  'smile-big': '😁',
  'smile-small': '😊',
  closed: '😐',
  funny: '😝',
  round: '😯',
  kiss: '💋',
};

export const LIP_POSE_LABEL: Record<LipPose, string> = {
  'smile-big': 'Big smile lips',
  'smile-small': 'Small smile lips',
  closed: 'Closed lips',
  funny: 'Funny lips',
  round: 'Round lips',
  kiss: 'Kiss lips',
};
