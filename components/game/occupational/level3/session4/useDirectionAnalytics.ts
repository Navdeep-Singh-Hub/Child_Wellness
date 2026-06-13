/**
 * Therapist analytics for OT Level 3 Session 4 direction & size games.
 */
import { useCallback, useRef } from 'react';

export type DirectionAnalyticsSnapshot = {
  correctCount: number;
  errorCount: number;
  upwardSwipeAccuracy: number;
  downwardSwipeAccuracy: number;
  gestureSizeAccuracy: number;
  targetPrecision: number;
  directionErrors: number;
  avgReactionMs: number;
  spatialAwarenessScore: number;
  durationMs: number;
};

export function useDirectionAnalytics() {
  const sessionStart = useRef(Date.now());
  const correct = useRef(0);
  const errors = useRef(0);
  const upScores = useRef<number[]>([]);
  const downScores = useRef<number[]>([]);
  const sizeScores = useRef<number[]>([]);
  const precisionScores = useRef<number[]>([]);
  const directionErrors = useRef(0);
  const reactions = useRef<number[]>([]);
  const roundStart = useRef(Date.now());

  const reset = useCallback(() => {
    sessionStart.current = Date.now();
    correct.current = 0;
    errors.current = 0;
    upScores.current = [];
    downScores.current = [];
    sizeScores.current = [];
    precisionScores.current = [];
    directionErrors.current = 0;
    reactions.current = [];
    roundStart.current = Date.now();
  }, []);

  const startRound = useCallback(() => {
    roundStart.current = Date.now();
  }, []);

  const recordSuccess = useCallback(
    (opts?: {
      dir?: 'up' | 'down';
      score?: number;
      sizeScore?: number;
      precision?: number;
    }) => {
      correct.current += 1;
      reactions.current.push(Date.now() - roundStart.current);
      if (opts?.dir === 'up' && opts.score !== undefined) upScores.current.push(opts.score);
      if (opts?.dir === 'down' && opts.score !== undefined) downScores.current.push(opts.score);
      if (opts?.sizeScore !== undefined) sizeScores.current.push(opts.sizeScore);
      if (opts?.precision !== undefined) precisionScores.current.push(opts.precision);
    },
    [],
  );

  const recordDirectionError = useCallback(() => {
    errors.current += 1;
    directionErrors.current += 1;
  }, []);

  const recordError = useCallback(() => {
    errors.current += 1;
  }, []);

  const avg = (arr: number[]) =>
    arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const snapshot = useCallback((): DirectionAnalyticsSnapshot => {
    const total = correct.current + errors.current;
    const upwardSwipeAccuracy = avg(upScores.current);
    const downwardSwipeAccuracy = avg(downScores.current);
    const gestureSizeAccuracy = avg(sizeScores.current);
    const targetPrecision = avg(precisionScores.current);
    const spatialAwarenessScore = Math.round(
      (upwardSwipeAccuracy + downwardSwipeAccuracy + gestureSizeAccuracy + targetPrecision) / 4,
    ) || (total > 0 ? Math.round((correct.current / total) * 100) : 0);

    return {
      correctCount: correct.current,
      errorCount: errors.current,
      upwardSwipeAccuracy,
      downwardSwipeAccuracy,
      gestureSizeAccuracy,
      targetPrecision,
      directionErrors: directionErrors.current,
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
      directionAnalytics: s,
      upwardSwipeAccuracy: s.upwardSwipeAccuracy,
      downwardSwipeAccuracy: s.downwardSwipeAccuracy,
      gestureSizeAccuracy: s.gestureSizeAccuracy,
      targetPrecision: s.targetPrecision,
      directionErrors: s.directionErrors,
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
