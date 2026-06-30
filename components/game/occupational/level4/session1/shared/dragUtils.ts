/**
 * Helpers for OT Level 4 Session 1 horizontal drag games.
 */

export type DragColor = { name: string; emoji: string; hex: string };

export const DRAG_COLORS: DragColor[] = [
  { name: 'red', emoji: '🔴', hex: '#EF4444' },
  { name: 'blue', emoji: '🔵', hex: '#3B82F6' },
  { name: 'green', emoji: '🟢', hex: '#10B981' },
  { name: 'yellow', emoji: '🟡', hex: '#F59E0B' },
  { name: 'purple', emoji: '🟣', hex: '#8B5CF6' },
];

export const randomDragColor = () => DRAG_COLORS[Math.floor(Math.random() * DRAG_COLORS.length)]!;

export const distPx = (x1: number, y1: number, x2: number, y2: number) =>
  Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);

export { useTraceSound } from '@/components/game/occupational/level2/session2/traceUtils';
