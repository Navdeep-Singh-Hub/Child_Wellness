/**
 * Body-part zone helpers for OT Level 3 Session 8.
 */

import type { DifficultyTier } from '@/components/game/occupational/level3/session8/session8Pacing';

export type FlashPart = 'head' | 'shoulder' | 'arm' | 'hand' | 'leg' | 'foot' | 'knee' | 'chest';
export type FollowPart = 'head' | 'shoulder' | 'chest' | 'knee' | 'foot' | 'hand' | 'ear';
export type PuzzlePart = 'head' | 'torso' | 'arm' | 'leg';
export type ShoulderSide = 'left' | 'right';
export type TouchPart = 'head' | 'eyes' | 'nose' | 'mouth' | 'ears';
export type LateralPart =
  | 'leftShoulder'
  | 'rightShoulder'
  | 'leftHand'
  | 'rightHand'
  | 'leftKnee'
  | 'rightKnee';

export type BodyZone = {
  emoji: string;
  label: string;
  xPct: number;
  yPct: number;
};

export type PuzzlePartConfig = BodyZone & {
  startXPct: number;
  startYPct: number;
};

export const TOUCH_ZONES: Record<TouchPart, BodyZone> = {
  head: { emoji: '👤', label: 'Head', xPct: 50, yPct: 18 },
  eyes: { emoji: '👀', label: 'Eyes', xPct: 50, yPct: 22 },
  nose: { emoji: '👃', label: 'Nose', xPct: 50, yPct: 28 },
  mouth: { emoji: '👄', label: 'Mouth', xPct: 50, yPct: 34 },
  ears: { emoji: '👂', label: 'Ears', xPct: 38, yPct: 24 },
};

export const LATERAL_ZONES: Record<LateralPart, BodyZone> = {
  leftShoulder: { emoji: '💪', label: 'Left shoulder', xPct: 28, yPct: 32 },
  rightShoulder: { emoji: '💪', label: 'Right shoulder', xPct: 72, yPct: 32 },
  leftHand: { emoji: '✋', label: 'Left hand', xPct: 22, yPct: 52 },
  rightHand: { emoji: '✋', label: 'Right hand', xPct: 78, yPct: 52 },
  leftKnee: { emoji: '🦵', label: 'Left knee', xPct: 40, yPct: 66 },
  rightKnee: { emoji: '🦵', label: 'Right knee', xPct: 60, yPct: 66 },
};

export const FLASH_ZONES: Record<FlashPart, BodyZone> = {
  head: { emoji: '👤', label: 'Head', xPct: 50, yPct: 18 },
  shoulder: { emoji: '💪', label: 'Shoulder', xPct: 38, yPct: 32 },
  arm: { emoji: '💪', label: 'Arm', xPct: 28, yPct: 44 },
  hand: { emoji: '✋', label: 'Hand', xPct: 24, yPct: 54 },
  chest: { emoji: '🫁', label: 'Chest', xPct: 50, yPct: 42 },
  leg: { emoji: '🦵', label: 'Leg', xPct: 46, yPct: 66 },
  knee: { emoji: '🦵', label: 'Knee', xPct: 46, yPct: 64 },
  foot: { emoji: '👣', label: 'Foot', xPct: 50, yPct: 78 },
};

export const FOLLOW_ZONES: Record<FollowPart, BodyZone> = {
  head: { emoji: '👤', label: 'Head', xPct: 50, yPct: 18 },
  shoulder: { emoji: '💪', label: 'Shoulder', xPct: 34, yPct: 32 },
  chest: { emoji: '🫁', label: 'Chest', xPct: 50, yPct: 44 },
  hand: { emoji: '✋', label: 'Hand', xPct: 26, yPct: 54 },
  ear: { emoji: '👂', label: 'Ear', xPct: 38, yPct: 24 },
  knee: { emoji: '🦵', label: 'Knee', xPct: 46, yPct: 64 },
  foot: { emoji: '👣', label: 'Foot', xPct: 50, yPct: 78 },
};

export const PUZZLE_PARTS: Record<PuzzlePart, PuzzlePartConfig> = {
  head: { emoji: '👤', label: 'Head', xPct: 50, yPct: 20, startXPct: 16, startYPct: 72 },
  torso: { emoji: '🤖', label: 'Torso', xPct: 50, yPct: 40, startXPct: 84, startYPct: 72 },
  arm: { emoji: '🦾', label: 'Arm', xPct: 30, yPct: 34, startXPct: 16, startYPct: 84 },
  leg: { emoji: '🦵', label: 'Leg', xPct: 50, yPct: 60, startXPct: 84, startYPct: 84 },
};

export const HEAD_ZONE: BodyZone = TOUCH_ZONES.head;
export const LEFT_SHOULDER: BodyZone = LATERAL_ZONES.leftShoulder;
export const RIGHT_SHOULDER: BodyZone = LATERAL_ZONES.rightShoulder;

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]!;

export const randomTouchPart = (tier: DifficultyTier): TouchPart => {
  if (tier <= 2) return 'head';
  const pool: TouchPart[] = tier === 3 ? ['head', 'eyes', 'nose'] : ['head', 'eyes', 'nose', 'mouth', 'ears'];
  return pick(pool);
};

export const touchPartTts = (part: TouchPart) => `Touch the ${TOUCH_ZONES[part].label.toUpperCase()}!`;

export const lateralPool = (tier: DifficultyTier): LateralPart[] => {
  if (tier <= 1) return ['leftShoulder', 'rightShoulder'];
  if (tier === 2) return ['leftShoulder', 'rightShoulder', 'leftHand', 'rightHand'];
  return ['leftShoulder', 'rightShoulder', 'leftHand', 'rightHand', 'leftKnee', 'rightKnee'];
};

export const randomLateralPart = (tier: DifficultyTier): LateralPart => pick(lateralPool(tier));

export const lateralTts = (part: LateralPart) => `Touch ${LATERAL_ZONES[part].label.toUpperCase()}!`;

export const randomFlashPart = (tier: DifficultyTier): FlashPart => {
  const keys = Object.keys(FLASH_ZONES) as FlashPart[];
  if (tier <= 2) return pick(keys.filter((k) => ['head', 'hand', 'foot', 'shoulder'].includes(k)));
  return pick(keys);
};

export const randomFollowPart = (): FollowPart => pick(Object.keys(FOLLOW_ZONES) as FollowPart[]);

export const buildFollowSequence = (len: number): FollowPart[] => {
  const seq: FollowPart[] = [];
  for (let i = 0; i < len; i += 1) {
    let part = randomFollowPart();
    while (seq.length > 0 && seq[seq.length - 1] === part) part = randomFollowPart();
    seq.push(part);
  }
  return seq;
};

export const randomShoulder = (): ShoulderSide => (Math.random() > 0.5 ? 'left' : 'right');

export const distPx = (x1Pct: number, y1Pct: number, x2Pct: number, y2Pct: number, w: number, h: number) => {
  const dx = ((x1Pct - x2Pct) / 100) * w;
  const dy = ((y1Pct - y2Pct) / 100) * h;
  return Math.sqrt(dx * dx + dy * dy);
};

export const scoreReaction = (ms: number, limitMs: number) => {
  if (limitMs <= 0) return 90;
  const ratio = ms / limitMs;
  if (ratio <= 0.5) return 100;
  if (ratio <= 0.75) return 85;
  if (ratio <= 1) return 70;
  return 0;
};

export { useTraceSound } from '@/components/game/occupational/level2/session2/traceUtils';
