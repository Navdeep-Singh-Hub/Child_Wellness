/**
 * Therapist analytics for OT Level 3 Session 2 big vs small movement games.
 */
import { useCallback, useRef } from 'react';
import type { ScaleMoveMode } from '@/components/game/occupational/level3/session2/scaleUtils';

export type ScaleAnalyticsSnapshot = {
  correctCount: number;
  errorCount: number;
  movementScaleAccuracy: number;
  swipeDistanceControl: number;
  pinchPrecision: number;
  stretchPrecision: number;
  throwForceControl: number;
  tracingAccuracy: number;
  tracingSmoothness: number;
  avgReactionMs: number;
  sessionScore: number;
  durationMs: number;
};

export function useScaleAnalytics(mode: ScaleMoveMode) {
  const sessionStart = useRef(Date.now());
  const correct = useRef(0);
  const errors = useRef(0);
  const swipeScores = useRef<number[]>([]);
  const pinchScores = useRef<number[]>([]);
  const stretchScores = useRef<number[]>([]);
  const throwScores = useRef<number[]>([]);
  const traceAccuracy = useRef<number[]>([]);
  const traceSmoothness = useRef<number[]>([]);
  const reactionTimes = useRef<number[]>([]);
  const roundStart = useRef(Date.now());

  const reset = useCallback(() => {
    sessionStart.current = Date.now();
    correct.current = 0;
    errors.current = 0;
    swipeScores.current = [];
    pinchScores.current = [];
    stretchScores.current = [];
    throwScores.current = [];
    traceAccuracy.current = [];
    traceSmoothness.current = [];
    reactionTimes.current = [];
    roundStart.current = Date.now();
  }, []);

  const startRound = useCallback(() => {
    roundStart.current = Date.now();
  }, []);

  const recordSuccess = useCallback(
    (opts?: {
      swipeScore?: number;
      pinchScore?: number;
      stretchScore?: number;
      throwScore?: number;
      traceAcc?: number;
      traceSmooth?: number;
    }) => {
      correct.current += 1;
      reactionTimes.current.push(Date.now() - roundStart.current);
      if (opts?.swipeScore !== undefined) swipeScores.current.push(opts.swipeScore);
      if (opts?.pinchScore !== undefined) pinchScores.current.push(opts.pinchScore);
      if (opts?.stretchScore !== undefined) stretchScores.current.push(opts.stretchScore);
      if (opts?.throwScore !== undefined) throwScores.current.push(opts.throwScore);
      if (opts?.traceAcc !== undefined) traceAccuracy.current.push(opts.traceAcc);
      if (opts?.traceSmooth !== undefined) traceSmoothness.current.push(opts.traceSmooth);
    },
    [],
  );

  const recordError = useCallback(() => {
    errors.current += 1;
  }, []);

  const avg = (arr: number[]) =>
    arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const snapshot = useCallback((): ScaleAnalyticsSnapshot => {
    const total = correct.current + errors.current;
    const movementScaleAccuracy =
      total > 0 ? Math.round((correct.current / total) * 100) : 0;
    const reactions = reactionTimes.current;
    const avgReactionMs =
      reactions.length > 0
        ? Math.round(reactions.reduce((a, b) => a + b, 0) / reactions.length)
        : 0;

    return {
      correctCount: correct.current,
      errorCount: errors.current,
      movementScaleAccuracy,
      swipeDistanceControl: avg(swipeScores.current),
      pinchPrecision: avg(pinchScores.current),
      stretchPrecision: avg(stretchScores.current),
      throwForceControl: avg(throwScores.current),
      tracingAccuracy: avg(traceAccuracy.current),
      tracingSmoothness: avg(traceSmoothness.current),
      avgReactionMs,
      sessionScore: correct.current,
      durationMs: Date.now() - sessionStart.current,
    };
  }, []);

  const metaPayload = useCallback(() => {
    const s = snapshot();
    return {
      scaleAnalytics: s,
      scaleMode: mode,
      movementScaleAccuracy: s.movementScaleAccuracy,
      swipeDistanceControl: s.swipeDistanceControl,
      pinchPrecision: s.pinchPrecision,
      stretchPrecision: s.stretchPrecision,
      throwForceControl: s.throwForceControl,
      tracingAccuracy: s.tracingAccuracy,
      tracingSmoothness: s.tracingSmoothness,
      errorFrequency: s.errorCount,
      avgReactionMs: s.avgReactionMs,
    };
  }, [mode, snapshot]);

  return {
    reset,
    startRound,
    recordSuccess,
    recordError,
    snapshot,
    metaPayload,
  };
}
