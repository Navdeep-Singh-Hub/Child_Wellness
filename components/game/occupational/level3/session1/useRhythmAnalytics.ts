/**
 * Therapist analytics tracker for OT Level 3 Session 1 rhythm games.
 */
import { useCallback, useRef } from 'react';
import type { TimingGrade } from '@/components/game/occupational/level3/session1/rhythmUtils';

export type RhythmAnalyticsSnapshot = {
  perfectCount: number;
  goodCount: number;
  missCount: number;
  missedBeats: number;
  stopViolations: number;
  avgReactionMs: number;
  accuracyPct: number;
  rhythmConsistency: number;
  durationMs: number;
};

export function useRhythmAnalytics() {
  const sessionStart = useRef(Date.now());
  const perfect = useRef(0);
  const good = useRef(0);
  const miss = useRef(0);
  const missedBeats = useRef(0);
  const stopViolations = useRef(0);
  const reactionTimes = useRef<number[]>([]);

  const reset = useCallback(() => {
    sessionStart.current = Date.now();
    perfect.current = 0;
    good.current = 0;
    miss.current = 0;
    missedBeats.current = 0;
    stopViolations.current = 0;
    reactionTimes.current = [];
  }, []);

  const recordTiming = useCallback((grade: TimingGrade, reactionMs?: number) => {
    if (grade === 'perfect') perfect.current += 1;
    else if (grade === 'good') good.current += 1;
    else miss.current += 1;
    if (reactionMs !== undefined && reactionMs >= 0) {
      reactionTimes.current.push(reactionMs);
    }
  }, []);

  const recordMissedBeat = useCallback(() => {
    missedBeats.current += 1;
  }, []);

  const recordStopViolation = useCallback(() => {
    stopViolations.current += 1;
    miss.current += 1;
  }, []);

  const snapshot = useCallback((): RhythmAnalyticsSnapshot => {
    const total = perfect.current + good.current + miss.current;
    const reactions = reactionTimes.current;
    const avgReactionMs =
      reactions.length > 0 ? Math.round(reactions.reduce((a, b) => a + b, 0) / reactions.length) : 0;
    const accuracyPct = total > 0 ? Math.round(((perfect.current + good.current * 0.6) / total) * 100) : 0;
    const rhythmConsistency =
      reactions.length > 1
        ? Math.max(
            0,
            100 -
              Math.round(
                reactions.reduce((sum, t, i) => {
                  if (i === 0) return sum;
                  return sum + Math.abs(t - reactions[i - 1]!);
                }, 0) /
                  (reactions.length - 1),
              ),
          )
        : 100;

    return {
      perfectCount: perfect.current,
      goodCount: good.current,
      missCount: miss.current,
      missedBeats: missedBeats.current,
      stopViolations: stopViolations.current,
      avgReactionMs,
      accuracyPct,
      rhythmConsistency,
      durationMs: Date.now() - sessionStart.current,
    };
  }, []);

  const metaPayload = useCallback(() => {
    const s = snapshot();
    return {
      rhythmAnalytics: s,
      perfectHits: s.perfectCount,
      goodHits: s.goodCount,
      misses: s.missCount,
      avgReactionMs: s.avgReactionMs,
      rhythmConsistency: s.rhythmConsistency,
    };
  }, [snapshot]);

  return {
    reset,
    recordTiming,
    recordMissedBeat,
    recordStopViolation,
    snapshot,
    metaPayload,
  };
}
