/**
 * Therapist analytics for OT Level 3 Session 5 left-right games.
 */
import { useCallback, useRef } from 'react';
import type { HorizontalDir } from '@/components/game/occupational/level3/session5/horizontalUtils';

export type HorizontalAnalyticsSnapshot = {
  correctCount: number;
  errorCount: number;
  leftAccuracy: number;
  rightAccuracy: number;
  directionConfusion: number;
  mirrorPerformance: number;
  visualTrackingScore: number;
  avgReactionMs: number;
  spatialAwarenessScore: number;
  durationMs: number;
};

export function useHorizontalAnalytics() {
  const sessionStart = useRef(Date.now());
  const correct = useRef(0);
  const errors = useRef(0);
  const leftScores = useRef<number[]>([]);
  const rightScores = useRef<number[]>([]);
  const mirrorScores = useRef<number[]>([]);
  const trackingScores = useRef<number[]>([]);
  const confusion = useRef(0);
  const reactions = useRef<number[]>([]);
  const roundStart = useRef(Date.now());

  const reset = useCallback(() => {
    sessionStart.current = Date.now();
    correct.current = 0;
    errors.current = 0;
    leftScores.current = [];
    rightScores.current = [];
    mirrorScores.current = [];
    trackingScores.current = [];
    confusion.current = 0;
    reactions.current = [];
    roundStart.current = Date.now();
  }, []);

  const startRound = useCallback(() => {
    roundStart.current = Date.now();
  }, []);

  const recordSuccess = useCallback(
    (opts?: { dir?: HorizontalDir; score?: number; mirror?: boolean; tracking?: number }) => {
      correct.current += 1;
      reactions.current.push(Date.now() - roundStart.current);
      if (opts?.dir === 'left' && opts.score !== undefined) leftScores.current.push(opts.score);
      if (opts?.dir === 'right' && opts.score !== undefined) rightScores.current.push(opts.score);
      if (opts?.mirror && opts.score !== undefined) mirrorScores.current.push(opts.score);
      if (opts?.tracking !== undefined) trackingScores.current.push(opts.tracking);
    },
    [],
  );

  const recordDirectionError = useCallback(() => {
    errors.current += 1;
    confusion.current += 1;
  }, []);

  const recordError = useCallback(() => {
    errors.current += 1;
  }, []);

  const avg = (arr: number[]) =>
    arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const snapshot = useCallback((): HorizontalAnalyticsSnapshot => {
    const leftAccuracy = avg(leftScores.current);
    const rightAccuracy = avg(rightScores.current);
    const mirrorPerformance = avg(mirrorScores.current);
    const visualTrackingScore = avg(trackingScores.current);
    const total = correct.current + errors.current;
    const spatialAwarenessScore =
      Math.round((leftAccuracy + rightAccuracy + visualTrackingScore) / 3) ||
      (total > 0 ? Math.round((correct.current / total) * 100) : 0);

    return {
      correctCount: correct.current,
      errorCount: errors.current,
      leftAccuracy,
      rightAccuracy,
      directionConfusion: confusion.current,
      mirrorPerformance,
      visualTrackingScore,
      avgReactionMs:
        reactions.current.length > 0
          ? Math.round(reactions.current.reduce((a, b) => a + b, 0) / reactions.current.length)
          : 0,
      spatialAwarenessScore,
      durationMs: Date.now() - sessionStart.current,
    };
  }, []);

  const metaPayload = useCallback(() => {
    const s = snapshot();
    return {
      horizontalAnalytics: s,
      leftAccuracy: s.leftAccuracy,
      rightAccuracy: s.rightAccuracy,
      directionConfusion: s.directionConfusion,
      mirrorPerformance: s.mirrorPerformance,
      visualTrackingScore: s.visualTrackingScore,
      spatialAwarenessScore: s.spatialAwarenessScore,
      avgReactionMs: s.avgReactionMs,
    };
  }, [snapshot]);

  return {
    reset,
    startRound,
    recordSuccess,
    recordDirectionError,
    recordError,
    snapshot,
    metaPayload,
  };
};
