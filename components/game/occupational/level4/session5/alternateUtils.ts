/**
 * Helpers for OT Level 4 Session 5 alternating-hand games.
 */

export { useTraceSound } from '@/components/game/occupational/level4/session1/dragUtils';

export type Hand = 'left' | 'right';

export const otherHand = (h: Hand): Hand => (h === 'left' ? 'right' : 'left');
