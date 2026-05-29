/** Level 5 Session 6 — Facial Imitation & Mirror Play (no camera) */

export type FacialImitationState =
  | 'IDLE'
  | 'SHOWING_ANIMATION'
  | 'WAITING_FOR_IMITATION'
  | 'REWARDING'
  | 'HELPING'
  | 'PAUSED';

export type FacePose =
  | 'smile-big'
  | 'open'
  | 'small'
  | 'surprised'
  | 'happy'
  | 'sleepy'
  | 'funny'
  | 'silly';

export type FacialDifficulty = 'easy' | 'medium' | 'hard';

export type FacialImitationGameId =
  | 'funny-face-mirror'
  | 'happy-sad-copy'
  | 'monster-face-match'
  | 'mirror-dance-faces'
  | 'face-adventure-copy';

export interface FacialImitationSnapshot {
  state: FacialImitationState;
  facePrompt: FacePose;
  promptLabel: string;
  gameProgress: number;
  interactionCount: number;
  rewardState: boolean;
  interactionPulse: boolean;
  showHelper: boolean;
  engagementLevel: number;
}

export interface FacialImitationAnalyticsRecord {
  interactionCount: number;
  engagementTimeMs: number;
  gameCompletion: number;
  playPatterns: string[];
  lastUpdated: number;
}

export const FACE_POSE_EMOJI: Record<FacePose, string> = {
  'smile-big': '😁',
  open: '😮',
  small: '😊',
  surprised: '😲',
  happy: '😄',
  sleepy: '😴',
  funny: '🤪',
  silly: '😝',
};

export const FACE_POSE_LABEL: Record<FacePose, string> = {
  'smile-big': 'Big smile face',
  open: 'Open mouth face',
  small: 'Small mouth face',
  surprised: 'Surprised face',
  happy: 'Happy face',
  sleepy: 'Sleepy face',
  funny: 'Funny face',
  silly: 'Silly face',
};
