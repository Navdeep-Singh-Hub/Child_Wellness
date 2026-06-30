/** Per-letter accent colors for 14 slant/curve letters. */
export const LETTER_COLORS = [
  '#EF4444', '#F59E0B', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899',
  '#14B8A6', '#F97316', '#6366F1', '#10B981', '#E11D48', '#0EA5E9',
  '#A855F7', '#D946EF',
] as const;

export function letterColor(index: number): string {
  return LETTER_COLORS[index % LETTER_COLORS.length];
}
