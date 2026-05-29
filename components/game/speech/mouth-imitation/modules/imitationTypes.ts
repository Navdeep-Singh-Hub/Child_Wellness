/** Level 5 Session 2 — Mouth Movement Imitation (camera + Good try fallback) */

export type ImitationGameState =
  | 'IDLE'
  | 'SHOWING_ANIMATION'
  | 'WAITING_FOR_IMITATION'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type MouthPose = 'open' | 'close' | 'wide' | 'small' | 'round' | 'smile' | 'funny';

export type ImitationDifficulty = 'easy' | 'medium' | 'hard';

export type ImitationGameId =
  | 'copy-happy-mouth'
  | 'funny-monster-mouth'
  | 'mirror-mouth-match'
  | 'open-close-dance'
  | 'silly-face-copy';

export interface ImitationSnapshot {
  state: ImitationGameState;
  imitationPrompt: MouthPose;
  promptLabel: string;
  successState: boolean;
  gameProgress: number;
  interactionCount: number;
  attemptPulse: boolean;
  showHelper: boolean;
  pacingMs: number;
}

export interface ImitationAnalyticsRecord {
  attemptCount: number;
  engagementTimeMs: number;
  gameCompletion: number;
  interactionPatterns: string[];
  lastUpdated: number;
}

export const MOUTH_POSE_FACE: Record<MouthPose, string> = {
  open: '😮',
  close: '😐',
  wide: '😲',
  small: '😗',
  round: '😯',
  smile: '😊',
  funny: '😝',
};

export const MOUTH_POSE_LABEL: Record<MouthPose, string> = {
  open: 'Open your mouth',
  close: 'Close your mouth',
  wide: 'Make a wide mouth',
  small: 'Make a small mouth',
  round: 'Round your lips',
  smile: 'Smile with your mouth',
  funny: 'Make a silly mouth',
};
