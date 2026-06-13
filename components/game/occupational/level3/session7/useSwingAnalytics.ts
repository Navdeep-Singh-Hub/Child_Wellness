/**
 * Therapist analytics for OT Level 3 Session 7 swing & circular motion games.
 */
import { useCallback, useRef } from 'react';
import type { TimingGrade } from '@/components/game/occupational/level3/session7/swingUtils';

export type SwingAnalyticsSnapshot = {
  correctCount: number;
  errorCount: number;
  swingAccuracy: number;
  circularAccuracy: number;
  gestureSmoothness: number;
  timingPrecision: number;
  rhythmMatching: number;
  visualTrackingScore: number;
  motorPlanningScore: number;
  avgReactionMs: number;
  coordinationScore: number;
  durationMs: number;
};

export function useSwingAnalytics() {
  const sessionStart = useRef(Date.now());
  const correct = useRef(0);
  const errors = useRef(0);
  const swingScores = useRef<number[]>([]);
  const circleScores = useRef<number[]>([]);
  const smoothnessScores = useRef<number[]>([]);
  const timingScores = useRef<number[]>([]);
  const rhythmScores = useRef<number[]>([]);
  const trackingScores = useRef<number[]>([]);
  const motorScores = useRef<number[]>([]);
  const reactions = useRef<number[]>([]);
  const roundStart = useRef(Date.now());

  const reset = useCallback(() => {
    sessionStart.current = Date.now();
    correct.current = 0;
    errors.current = 0;
    swingScores.current = [];
    circleScores.current = [];
    smoothnessScores.current = [];
    timingScores.current = [];
    rhythmScores.current = [];
    trackingScores.current = [];
    motorScores.current = [];
    reactions.current = [];
    roundStart.current = Date.now();
  }, []);

  const startRound = useCallback(() => {
    roundStart.current = Date.now();
  }, []);

  const recordSuccess = useCallback(
    (opts?: {
      swing?: number;
      circular?: number;
      smoothness?: number;
      timing?: number;
      rhythm?: number;
      tracking?: number;
      motor?: number;
    }) => {
      correct.current += 1;
      reactions.current.push(Date.now() - roundStart.current);
      if (opts?.swing !== undefined) swingScores.current.push(opts.swing);
      if (opts?.circular !== undefined) circleScores.current.push(opts.circular);
      if (opts?.smoothness !== undefined) smoothnessScores.current.push(opts.smoothness);
      if (opts?.timing !== undefined) timingScores.current.push(opts.timing);
      if (opts?.rhythm !== undefined) rhythmScores.current.push(opts.rhythm);
      if (opts?.tracking !== undefined) trackingScores.current.push(opts.tracking);
      if (opts?.motor !== undefined) motorScores.current.push(opts.motor);
    },
    [],
  );

  const recordError = useCallback(() => {
    errors.current += 1;
  }, []);

  const recordTiming = useCallback((_grade: TimingGrade, reactionMs?: number) => {
    if (reactionMs !== undefined && reactionMs >= 0) reactions.current.push(reactionMs);
  }, []);

  const avg = (arr: number[]) =>
    arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const snapshot = useCallback((): SwingAnalyticsSnapshot => {
    const swingAccuracy = avg(swingScores.current);
    const circularAccuracy = avg(circleScores.current);
    const gestureSmoothness = avg(smoothnessScores.current);
    const timingPrecision = avg(timingScores.current);
    const rhythmMatching = avg(rhythmScores.current);
    const visualTrackingScore = avg(trackingScores.current);
    const motorPlanningScore = avg(motorScores.current);
    const total = correct.current + errors.current;
    const baseAccuracy = total > 0 ? Math.round((correct.current / total) * 100) : 0;
    const coordinationScore =
      Math.round(
        (swingAccuracy +
          circularAccuracy +
          gestureSmoothness +
          timingPrecision +
          rhythmMatching +
          motorPlanningScore +
          baseAccuracy) /
          7,
      ) || baseAccuracy;

    return {
      correctCount: correct.current,
      errorCount: errors.current,
      swingAccuracy,
      circularAccuracy,
      gestureSmoothness,
      timingPrecision,
      rhythmMatching,
      visualTrackingScore,
      motorPlanningScore,
      avgReactionMs:
        reactions.current.length > 0
          ? Math.round(reactions.current.reduce((a, b) => a + b, 0) / reactions.current.length)
          : 0,
      coordinationScore,
      durationMs: Date.now() - sessionStart.current,
    };
  }, []);

  const metaPayload = useCallback(() => {
    const s = snapshot();
    return {
      swingAnalytics: s,
      swingAccuracy: s.swingAccuracy,
      circularAccuracy: s.circularAccuracy,
      gestureSmoothness: s.gestureSmoothness,
      timingPrecision: s.timingPrecision,
      rhythmMatching: s.rhythmMatching,
      coordinationScore: s.coordinationScore,
      avgReactionMs: s.avgReactionMs,
    };
  }, [snapshot]);

  return {
    reset,
    startRound,
    recordSuccess,
    recordError,
    recordTiming,
    snapshot,
    metaPayload,
  };
};
