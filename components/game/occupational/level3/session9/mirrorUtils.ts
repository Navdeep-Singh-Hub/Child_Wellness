/**
 * Pose / mirror helpers for OT Level 3 Session 9.
 */

export type PoseType = 'hands-up' | 'hands-down' | 'hands-left' | 'hands-right' | 'clap';
export type HandSide = 'left' | 'right';
export type Movement = 'up' | 'down' | 'left' | 'right' | 'tap';

export const POSE_EMOJIS: Record<PoseType, string> = {
  'hands-up': '🙌',
  'hands-down': '👇',
  'hands-left': '👈',
  'hands-right': '👉',
  clap: '👏',
};

export const HAND_EMOJIS: Record<HandSide, string> = {
  left: '👈',
  right: '👉',
};

export const MOVEMENT_EMOJIS: Record<Movement, string> = {
  up: '⬆️',
  down: '⬇️',
  left: '⬅️',
  right: '➡️',
  tap: '👆',
};

const POSE_LIST: PoseType[] = ['hands-up', 'hands-down', 'hands-left', 'hands-right', 'clap'];
const MOVEMENT_LIST: Movement[] = ['up', 'down', 'left', 'right', 'tap'];

export const poseLabel = (p: PoseType) =>
  p === 'hands-up'
    ? 'hands up'
    : p === 'hands-down'
      ? 'hands down'
      : p === 'hands-left'
        ? 'hands left'
        : p === 'hands-right'
          ? 'hands right'
          : 'clap';

export const randomPose = () => POSE_LIST[Math.floor(Math.random() * POSE_LIST.length)]!;
export const randomHand = (): HandSide => (Math.random() > 0.5 ? 'left' : 'right');
export const mirrorHand = (side: HandSide): HandSide => (side === 'left' ? 'right' : 'left');

export const generatePattern = (len = 3): Movement[] =>
  Array.from({ length: len }, () => MOVEMENT_LIST[Math.floor(Math.random() * MOVEMENT_LIST.length)]!);

export { useTraceSound } from '@/components/game/occupational/level2/session2/traceUtils';
