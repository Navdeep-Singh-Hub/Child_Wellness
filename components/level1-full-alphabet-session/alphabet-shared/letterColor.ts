/** Rotating accent palette for A–Z letter index. */
const PALETTE = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#22C55E', '#14B8A6',
  '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  '#EC4899', '#F43F5E', '#0EA5E9', '#10B981', '#EAB308', '#FB7185',
  '#7C3AED', '#059669', '#DC2626', '#2563EB', '#CA8A04', '#9333EA',
  '#0891B2', '#BE185D',
] as const;

export function letterColor(index: number): string {
  return PALETTE[index % PALETTE.length];
}

export function letterIndex(letter: string, names: string[]): number {
  const i = names.indexOf(letter);
  return i >= 0 ? i : 0;
}
