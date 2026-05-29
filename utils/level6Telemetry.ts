/**
 * Level 6 — lightweight in-memory telemetry counters that surface
 * `confirmedMatches`, `partialMatches`, and `goodTryFallbacks` into the
 * `meta` payload of `logGameAndAward` so therapists can see how often the
 * camera detector actually carried the round.
 *
 * Counters live in module scope so any Level 6 game (or shared shell) can
 * `recordLevel6Match*` while `useLevel6MouthTarget` runs, then the shared
 * session frame calls `consumeLevel6Telemetry()` when the game ends.
 */

import type { Level6Target } from '@/hooks/useLevel6MouthTarget';

export interface Level6TelemetryCounts {
  confirmedMatches: number;
  partialMatches: number;
  goodTryFallbacks: number;
  perTarget: Record<string, { match: number; partial: number; goodTry: number }>;
}

function emptyCounts(): Level6TelemetryCounts {
  return {
    confirmedMatches: 0,
    partialMatches: 0,
    goodTryFallbacks: 0,
    perTarget: {},
  };
}

let counts: Level6TelemetryCounts = emptyCounts();

function bucket(target: Level6Target) {
  const key = String(target);
  if (!counts.perTarget[key]) counts.perTarget[key] = { match: 0, partial: 0, goodTry: 0 };
  return counts.perTarget[key];
}

export function recordLevel6Match(target: Level6Target): void {
  counts.confirmedMatches += 1;
  bucket(target).match += 1;
}

export function recordLevel6Partial(target: Level6Target): void {
  counts.partialMatches += 1;
  bucket(target).partial += 1;
}

export function recordLevel6GoodTry(target: Level6Target): void {
  counts.goodTryFallbacks += 1;
  bucket(target).goodTry += 1;
}

/**
 * Returns a snapshot of the counters and resets them. Designed to be merged
 * into the analytics `meta` object the game posts to `logGameAndAward`.
 */
export function consumeLevel6Telemetry(): Level6TelemetryCounts {
  const snapshot = counts;
  counts = emptyCounts();
  return snapshot;
}

/** Test / hot-reload helper. */
export function resetLevel6Telemetry(): void {
  counts = emptyCounts();
}
