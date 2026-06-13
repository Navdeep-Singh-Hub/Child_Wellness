/**
 * Pose / mirror helpers for OT Level 3 Session 9 — Superhero Training Academy.
 */

import type { DifficultyTier } from '@/components/game/occupational/level3/session9/session9Pacing';

export type PoseType =
  | 'hands-up'
  | 'strong-pose'
  | 'airplane'
  | 'star-pose'
  | 'hero-pose'
  | 'hands-down'
  | 'hands-left'
  | 'hands-right'
  | 'clap';

export type HandSide = 'left' | 'right';
export type ChainMove = 'hands-up' | 'wave' | 'strong' | 'star' | 'hero' | 'clap';

export const POSE_EMOJIS: Record<PoseType, string> = {
  'hands-up': '🙆',
  'strong-pose': '💪',
  airplane: '🦅',
  'star-pose': '⭐',
  'hero-pose': '🦸',
  'hands-down': '👇',
  'hands-left': '👈',
  'hands-right': '👉',
  clap: '👏',
};

export const HAND_EMOJIS: Record<HandSide, string> = {
  left: '✋',
  right: '✋',
};

export const CHAIN_EMOJIS: Record<ChainMove, string> = {
  'hands-up': '🙆',
  wave: '👋',
  strong: '💪',
  star: '⭐',
  hero: '🦸',
  clap: '👏',
};

const BASIC_POSES: PoseType[] = ['hands-up', 'strong-pose', 'clap'];
const MID_POSES: PoseType[] = ['hands-up', 'strong-pose', 'airplane', 'star-pose', 'clap'];
const ALL_POSES: PoseType[] = [
  'hands-up',
  'strong-pose',
  'airplane',
  'star-pose',
  'hero-pose',
  'hands-left',
  'hands-right',
  'clap',
];

const BASIC_CHAIN: ChainMove[] = ['hands-up', 'wave', 'strong'];
const ALL_CHAIN: ChainMove[] = ['hands-up', 'wave', 'strong', 'star', 'hero', 'clap'];

export const poseLabel = (p: PoseType) => {
  const map: Record<PoseType, string> = {
    'hands-up': 'Hands Up',
    'strong-pose': 'Strong Pose',
    airplane: 'Airplane Arms',
    'star-pose': 'Star Pose',
    'hero-pose': 'Hero Pose',
    'hands-down': 'Hands Down',
    'hands-left': 'Hands Left',
    'hands-right': 'Hands Right',
    clap: 'Clap',
  };
  return map[p];
};

export const chainLabel = (m: ChainMove) => {
  const map: Record<ChainMove, string> = {
    'hands-up': 'Hands Up',
    wave: 'Wave',
    strong: 'Strong Pose',
    star: 'Star Pose',
    hero: 'Hero Pose',
    clap: 'Clap',
  };
  return map[m];
};

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]!;

export const posePool = (tier: DifficultyTier): PoseType[] => {
  if (tier <= 1) return BASIC_POSES;
  if (tier <= 2) return MID_POSES;
  return ALL_POSES;
};

export const randomPose = (tier: DifficultyTier = 2) => pick(posePool(tier));

export const randomHand = (): HandSide => (Math.random() > 0.5 ? 'left' : 'right');
export const mirrorHand = (side: HandSide): HandSide => (side === 'left' ? 'right' : 'left');

export const handDisplayLabel = (side: HandSide) => `${side === 'left' ? 'Left' : 'Right'} Hand`;

export const generateChainPattern = (len: number, tier: DifficultyTier): ChainMove[] => {
  const pool = tier <= 2 ? BASIC_CHAIN : ALL_CHAIN;
  const seq: ChainMove[] = [];
  for (let i = 0; i < len; i += 1) {
    let move = pick(pool);
    while (seq.length > 0 && seq[seq.length - 1] === move) move = pick(pool);
    seq.push(move);
  }
  return seq;
};

export const imitationScore = (tier: DifficultyTier, fast = false) => {
  const base = fast ? 78 : 85;
  return Math.min(100, base + tier * 4);
};

export { useTraceSound } from '@/components/game/occupational/level2/session2/traceUtils';
