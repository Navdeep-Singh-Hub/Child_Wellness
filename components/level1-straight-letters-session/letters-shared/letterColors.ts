/** Per-letter accent colors used across Session 4 games. */
export const LETTER_COLORS = ['#EF4444', '#F59E0B', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899'] as const;

export function letterColor(index: number): string {
  return LETTER_COLORS[index % LETTER_COLORS.length];
}
