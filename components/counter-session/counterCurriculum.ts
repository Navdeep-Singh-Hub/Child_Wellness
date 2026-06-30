/** Counter (Section 5) — session curriculum (sessions 1–10) */

export type CounterSessionConfig = {
  number: number;
  title: string;
  subtitle: string;
  emoji: string;
  zone: string;
};

export const COUNTER_CURRICULUM: CounterSessionConfig[] = [
  { number: 1, title: 'Patterns & Words', subtitle: 'Pattern, memory, BALL', emoji: '🔁', zone: 'Pattern Plaza' },
  { number: 2, title: 'Count & Compare', subtitle: 'Count, size, sequence', emoji: '🔢', zone: 'Count Corner' },
  { number: 3, title: 'Shapes & Sounds', subtitle: 'Shapes and listening', emoji: '🔺', zone: 'Shape Skyway' },
  { number: 4, title: 'Color & Match', subtitle: 'Colors and matching', emoji: '🎨', zone: 'Color Cloud' },
  { number: 5, title: 'Directions & Round', subtitle: 'Directions and round', emoji: '🧭', zone: 'Wind Vane' },
  { number: 6, title: 'Spot, Count & Shapes', subtitle: 'Spot and count', emoji: '🔍', zone: 'Eagle Lookout' },
  { number: 7, title: 'Pattern, Match & Build', subtitle: 'Patterns and build', emoji: '🧩', zone: 'Puzzle Peak' },
  { number: 8, title: 'Emotions, Match & Shapes', subtitle: 'Feelings and shapes', emoji: '😊', zone: 'Mood Meadow' },
  { number: 9, title: 'Logic, Memory & Shapes', subtitle: 'Logic challenges', emoji: '🧠', zone: 'Logic Loft' },
  { number: 10, title: 'Counter Master', subtitle: 'Final challenge', emoji: '🏆', zone: 'Summit Sky' },
];

export function getCounterSession(number: number): CounterSessionConfig {
  return COUNTER_CURRICULUM.find((s) => s.number === number) ?? COUNTER_CURRICULUM[0];
}
