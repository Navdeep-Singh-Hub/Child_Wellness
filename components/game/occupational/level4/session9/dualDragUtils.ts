/**
 * Helpers for OT Level 4 Session 9 dual-drag games.
 */

export { distPx, useTraceSound } from '@/components/game/occupational/level4/session1/dragUtils';

export type MatchShape = 'circle' | 'square' | 'triangle' | 'star';

const MATCH_SHAPES: { type: MatchShape; emoji: string }[] = [
  { type: 'circle', emoji: '⭕' },
  { type: 'square', emoji: '⬜' },
  { type: 'triangle', emoji: '🔺' },
  { type: 'star', emoji: '⭐' },
];

export const randomMatchShape = (): { type: MatchShape; emoji: string } =>
  MATCH_SHAPES[Math.floor(Math.random() * MATCH_SHAPES.length)];
