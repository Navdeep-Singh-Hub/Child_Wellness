/**
 * Helpers for OT Level 4 Session 3 diagonal drag games.
 */

export { distPx, randomDragColor, useTraceSound } from '@/components/game/occupational/level4/session1/dragUtils';
export type { DragColor } from '@/components/game/occupational/level4/session1/dragUtils';

export const MATCH_EMOJIS = ['🔴', '🟢', '🔵', '🟡', '🟣', '🟠'] as const;

export const randomMatchEmoji = () => MATCH_EMOJIS[Math.floor(Math.random() * MATCH_EMOJIS.length)]!;
