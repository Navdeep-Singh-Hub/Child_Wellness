/**
 * Therapist analytics for OT Level 6 Session 1 — Sitting Posture Control.
 * Tracks upright time, posture quality, stillness, reaction times and reach data.
 */
import { useCallback, useRef } from 'react';

export type PostureAnalyticsSnapshot = {
  uprightMs: number;
  totalActiveMs: number;
  uprightPct: number; // % of active time spent upright
  longestHoldMs: number;
  avgPostureQuality: number; // 0..100
  stillnessPct: number; // % of active time spent still (statue/freeze)
  starsCollected: number;
  correctFreezes: number;
  totalFreezePrompts: number;
  avgReactionMs: number;
  postureBreaks: number; // times posture dropped below threshold
  accuracyPct: number; // headline accuracy for the game-log
  durationMs: number;
};

export function usePostureAnalytics() {
  const sessionStart = useRef(Date.now());
  const uprightMs = useRef(0);
  const totalActiveMs = useRef(0);
  const longestHoldMs = useRef(0);
  const stillMs = useRef(0);
  const qualitySum = useRef(0);
  const qualitySamples = useRef(0);
  const starsCollected = useRef(0);
  const correctFreezes = useRef(0);
  const totalFreezePrompts = useRef(0);
  const reactionTimes = useRef<number[]>([]);
  const postureBreaks = useRef(0);

  const reset = useCallback(() => {
    sessionStart.current = Date.now();
    uprightMs.current = 0;
    totalActiveMs.current = 0;
    longestHoldMs.current = 0;
    stillMs.current = 0;
    qualitySum.current = 0;
    qualitySamples.current = 0;
    starsCollected.current = 0;
    correctFreezes.current = 0;
    totalFreezePrompts.current = 0;
    reactionTimes.current = [];
    postureBreaks.current = 0;
  }, []);

  /** Called each sampling tick with elapsed ms and the current posture quality (0..1). */
  const recordTick = useCallback(
    (deltaMs: number, opts: { upright: boolean; still: boolean; quality: number }) => {
      totalActiveMs.current += deltaMs;
      if (opts.upright) uprightMs.current += deltaMs;
      if (opts.still) stillMs.current += deltaMs;
      qualitySum.current += opts.quality;
      qualitySamples.current += 1;
    },
    [],
  );

  const recordHold = useCallback((holdMs: number) => {
    if (holdMs > longestHoldMs.current) longestHoldMs.current = holdMs;
  }, []);

  const recordPostureBreak = useCallback(() => {
    postureBreaks.current += 1;
  }, []);

  const recordStar = useCallback(() => {
    starsCollected.current += 1;
  }, []);

  const recordFreeze = useCallback((correct: boolean, reactionMs?: number) => {
    totalFreezePrompts.current += 1;
    if (correct) correctFreezes.current += 1;
    if (reactionMs !== undefined && reactionMs >= 0) reactionTimes.current.push(reactionMs);
  }, []);

  const snapshot = useCallback(
    (headlineAccuracyPct?: number): PostureAnalyticsSnapshot => {
      const active = totalActiveMs.current;
      const uprightPct = active > 0 ? Math.round((uprightMs.current / active) * 100) : 0;
      const stillnessPct = active > 0 ? Math.round((stillMs.current / active) * 100) : 0;
      const avgPostureQuality =
        qualitySamples.current > 0 ? Math.round((qualitySum.current / qualitySamples.current) * 100) : 0;
      const reactions = reactionTimes.current;
      const avgReactionMs =
        reactions.length > 0 ? Math.round(reactions.reduce((a, b) => a + b, 0) / reactions.length) : 0;
      const accuracyPct =
        headlineAccuracyPct !== undefined ? Math.round(headlineAccuracyPct) : avgPostureQuality;

      return {
        uprightMs: uprightMs.current,
        totalActiveMs: active,
        uprightPct,
        longestHoldMs: longestHoldMs.current,
        avgPostureQuality,
        stillnessPct,
        starsCollected: starsCollected.current,
        correctFreezes: correctFreezes.current,
        totalFreezePrompts: totalFreezePrompts.current,
        avgReactionMs,
        postureBreaks: postureBreaks.current,
        accuracyPct,
        durationMs: Date.now() - sessionStart.current,
      };
    },
    [],
  );

  const metaPayload = useCallback(
    (headlineAccuracyPct?: number) => {
      const s = snapshot(headlineAccuracyPct);
      return {
        postureAnalytics: s,
        uprightPct: s.uprightPct,
        longestHoldMs: s.longestHoldMs,
        avgPostureQuality: s.avgPostureQuality,
        stillnessPct: s.stillnessPct,
        avgReactionMs: s.avgReactionMs,
      };
    },
    [snapshot],
  );

  return {
    reset,
    recordTick,
    recordHold,
    recordPostureBreak,
    recordStar,
    recordFreeze,
    snapshot,
    metaPayload,
  };
}
