/** Matcher (Section 2) — small-letters session curriculum (sessions 1–10) */

const ALL = 'abcdefghijklmnopqrstuvwxyz'.split('');

export type MatcherSessionConfig = {
  number: number;
  title: string;
  subtitle: string;
  letters: string[];
  emoji: string;
  zone: string;
};

export const MATCHER_CURRICULUM: MatcherSessionConfig[] = [
  { number: 1, title: 'Easy Strokes', subtitle: 'i, l', letters: ['i', 'l'], emoji: '🐚', zone: 'Lagoon Shore' },
  { number: 2, title: 'Easy Strokes', subtitle: 't, i', letters: ['t', 'i'], emoji: '🦑', zone: 'Tide Pools' },
  { number: 3, title: 'Curves', subtitle: 'c, o', letters: ['c', 'o'], emoji: '🪼', zone: 'Coral Bend' },
  { number: 4, title: 'Curves', subtitle: 'a', letters: ['a'], emoji: '🐠', zone: 'Sandy Cove' },
  { number: 5, title: 'Mixed', subtitle: 'u, n', letters: ['u', 'n'], emoji: '🦀', zone: 'Rocky Reef' },
  { number: 6, title: 'Mixed', subtitle: 'm, h, r', letters: ['m', 'h', 'r'], emoji: '🌊', zone: 'Driftwood Bay' },
  { number: 7, title: 'Complex', subtitle: 'b, d', letters: ['b', 'd'], emoji: '🪞', zone: 'Pearl Depths' },
  { number: 8, title: 'Complex', subtitle: 'p, q, g', letters: ['p', 'q', 'g'], emoji: '📸', zone: 'Deep Snapshot' },
  { number: 9, title: 'Practice', subtitle: 'a–m', letters: 'abcdefghijklm'.split(''), emoji: '🧭', zone: 'Treasure Trail' },
  { number: 10, title: 'Master Voyage', subtitle: 'a–z', letters: ALL, emoji: '🏆', zone: 'Open Ocean' },
];

export function getMatcherSession(number: number): MatcherSessionConfig {
  return MATCHER_CURRICULUM.find((s) => s.number === number) ?? MATCHER_CURRICULUM[0];
}
