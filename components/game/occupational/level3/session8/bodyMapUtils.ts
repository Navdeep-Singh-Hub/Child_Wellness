/**
 * Body-part zone helpers for OT Level 3 Session 8.
 */

export type FlashPart = 'head' | 'shoulder' | 'arm' | 'hand' | 'leg' | 'foot';
export type FollowPart = 'head' | 'shoulder' | 'chest' | 'knee' | 'foot';
export type PuzzlePart = 'head' | 'torso' | 'arm' | 'leg';
export type ShoulderSide = 'left' | 'right';

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

export const FLASH_ZONES: Record<FlashPart, BodyZone> = {
  head: { emoji: '👤', label: 'Head', xPct: 50, yPct: 18 },
  shoulder: { emoji: '💪', label: 'Shoulder', xPct: 38, yPct: 32 },
  arm: { emoji: '💪', label: 'Arm', xPct: 28, yPct: 44 },
  hand: { emoji: '✋', label: 'Hand', xPct: 24, yPct: 54 },
  leg: { emoji: '🦵', label: 'Leg', xPct: 46, yPct: 66 },
  foot: { emoji: '👣', label: 'Foot', xPct: 50, yPct: 78 },
};

export const FOLLOW_ZONES: Record<FollowPart, BodyZone> = {
  head: { emoji: '👤', label: 'Head', xPct: 50, yPct: 18 },
  shoulder: { emoji: '💪', label: 'Shoulder', xPct: 34, yPct: 32 },
  chest: { emoji: '🫁', label: 'Chest', xPct: 50, yPct: 44 },
  knee: { emoji: '🦵', label: 'Knee', xPct: 46, yPct: 64 },
  foot: { emoji: '👣', label: 'Foot', xPct: 50, yPct: 78 },
};

export const PUZZLE_PARTS: Record<PuzzlePart, PuzzlePartConfig> = {
  head: { emoji: '👤', label: 'Head', xPct: 50, yPct: 20, startXPct: 18, startYPct: 72 },
  torso: { emoji: '🟦', label: 'Torso', xPct: 50, yPct: 40, startXPct: 82, startYPct: 72 },
  arm: { emoji: '💪', label: 'Arm', xPct: 30, yPct: 34, startXPct: 18, startYPct: 82 },
  leg: { emoji: '🦵', label: 'Leg', xPct: 50, yPct: 60, startXPct: 82, startYPct: 82 },
};

export const HEAD_ZONE: BodyZone = { emoji: '👤', label: 'Head', xPct: 50, yPct: 22 };
export const LEFT_SHOULDER: BodyZone = { emoji: '💪', label: 'Left shoulder', xPct: 30, yPct: 34 };
export const RIGHT_SHOULDER: BodyZone = { emoji: '💪', label: 'Right shoulder', xPct: 70, yPct: 34 };

export const randomFlashPart = (): FlashPart => {
  const keys = Object.keys(FLASH_ZONES) as FlashPart[];
  return keys[Math.floor(Math.random() * keys.length)]!;
};

export const randomFollowPart = (): FollowPart => {
  const keys = Object.keys(FOLLOW_ZONES) as FollowPart[];
  return keys[Math.floor(Math.random() * keys.length)]!;
};

export const randomShoulder = (): ShoulderSide => (Math.random() > 0.5 ? 'left' : 'right');

export const distPx = (x1Pct: number, y1Pct: number, x2Pct: number, y2Pct: number, w: number, h: number) => {
  const dx = ((x1Pct - x2Pct) / 100) * w;
  const dy = ((y1Pct - y2Pct) / 100) * h;
  return Math.sqrt(dx * dx + dy * dy);
};

export { useTraceSound } from '@/components/game/occupational/level2/session2/traceUtils';
