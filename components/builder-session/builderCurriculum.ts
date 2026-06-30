/** Builder (Section 3) — session curriculum (sessions 1–10) */

export type BuilderSessionConfig = {
  number: number;
  title: string;
  subtitle: string;
  emoji: string;
  zone: string;
};

export const BUILDER_CURRICULUM: BuilderSessionConfig[] = [
  { number: 1, title: 'Object & Shape Fun', subtitle: 'Objects, shapes, colors', emoji: '🧱', zone: 'Foundry Floor' },
  { number: 2, title: 'Word Builder & More', subtitle: 'Words, sort, puzzle', emoji: '🔤', zone: 'Letter Loft' },
  { number: 3, title: 'Memory & Match', subtitle: 'Remember and match', emoji: '🧠', zone: 'Memory Mine' },
  { number: 4, title: 'Colors & Patterns', subtitle: 'Colors and sequences', emoji: '🌈', zone: 'Prism Pass' },
  { number: 5, title: 'Trace, Count & Sort', subtitle: 'Trace, count, sort', emoji: '✏️', zone: 'Measure Ridge' },
  { number: 6, title: 'Memory, Direction & Match', subtitle: 'Directions and memory', emoji: '🧭', zone: 'Compass Camp' },
  { number: 7, title: 'Size, Numbers & Patterns', subtitle: 'Size and numbers', emoji: '📏', zone: 'Number Notch' },
  { number: 8, title: 'Emotions, Colors & More', subtitle: 'Feelings and colors', emoji: '😊', zone: 'Feeling Forge' },
  { number: 9, title: 'Spot the Difference & Shapes', subtitle: 'Spot differences', emoji: '🔍', zone: 'Detail Den' },
  { number: 10, title: 'Builder Master', subtitle: 'Final challenge', emoji: '🏆', zone: 'Summit Studio' },
];

export function getBuilderSession(number: number): BuilderSessionConfig {
  return BUILDER_CURRICULUM.find((s) => s.number === number) ?? BUILDER_CURRICULUM[0];
}
