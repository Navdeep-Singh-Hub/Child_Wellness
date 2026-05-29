/** Level 5 Session 5 — Jaw Awareness & Open–Close Basics (no camera) */

export type JawAwarenessState =
  | 'IDLE'
  | 'SHOWING_ANIMATION'
  | 'WAITING_FOR_INTERACTION'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type JawPose = 'open' | 'close' | 'yawn' | 'sleepy';

export type JawDifficulty = 'easy' | 'medium' | 'hard';

export type JawAwarenessGameId =
  | 'jaw-hungry-crocodile'
  | 'sleepy-lion-mouth'
  | 'mouth-elevator'
  | 'jaw-open-close-dance'
  | 'funny-jaw-adventure';

export interface JawAwarenessSnapshot {
  state: JawAwarenessState;
  jawPrompt: JawPose;
  promptLabel: string;
  gameProgress: number;
  interactionCount: number;
  rewardState: boolean;
  interactionPulse: boolean;
  showHelper: boolean;
  engagementLevel: number;
}

export interface JawAwarenessAnalyticsRecord {
  interactionCount: number;
  engagementTimeMs: number;
  gameCompletion: number;
  playPatterns: string[];
  lastUpdated: number;
}

export const JAW_POSE_FACE: Record<JawPose, string> = {
  open: '😮',
  close: '😌',
  yawn: '🥱',
  sleepy: '😴',
};

export const JAW_POSE_LABEL: Record<JawPose, string> = {
  open: 'Open your mouth wide',
  close: 'Close your mouth gently',
  yawn: 'Big yawn mouth',
  sleepy: 'Sleepy closed mouth',
};
