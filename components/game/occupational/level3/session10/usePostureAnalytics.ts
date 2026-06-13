/**
 * Therapist analytics for OT Level 3 Session 10 posture & hold games.
 */
import { useCallback, useRef } from 'react';

export type PostureAnalyticsSnapshot = {
  correctCount: number;
  errorCount: number;
  postureAccuracy: number;
  holdDurationScore: number;
  stabilityScore: number;
  balanceScore: number;
  bodyAwarenessScore: number;
  selfRegulationScore: number;
  coreControlScore: number;
  avgHoldMs: number;
  posturalControlRating: number;
  durationMs: number;
};

export function usePostureAnalytics() {
  const sessionStart = useRef(Date.now());
  const correct = useRef(0);
  const errors = useRef(0);
  const postureScores = useRef<number[]>([]);
  const holdScores = useRef<number[]>([]);
  const stabilityScores = useRef<number[]>([]);
  const balanceScores = useRef<number[]>([]);
  const awarenessScores = useRef<number[]>([]);
  const regulationScores = useRef<number[]>([]);
  const coreScores = useRef<number[]>([]);
  const holdTimes = useRef<number[]>([]);
  const roundStart = useRef(Date.now());

  const reset = useCallback(() => {
    sessionStart.current = Date.now();
    correct.current = 0;
    errors.current = 0;
    postureScores.current = [];
    holdScores.current = [];
    stabilityScores.current = [];
    balanceScores.current = [];
    awarenessScores.current = [];
    regulationScores.current = [];
    coreScores.current = [];
    holdTimes.current = [];
    roundStart.current = Date.now();
  }, []);

  const startRound = useCallback(() => {
    roundStart.current = Date.now();
  }, []);

  const recordSuccess = useCallback(
    (opts?: {
      posture?: number;
      hold?: number;
      stability?: number;
      balance?: number;
      awareness?: number;
      regulation?: number;
      core?: number;
      holdMs?: number;
    }) => {
      correct.current += 1;
      if (opts?.posture !== undefined) postureScores.current.push(opts.posture);
      if (opts?.hold !== undefined) holdScores.current.push(opts.hold);
      if (opts?.stability !== undefined) stabilityScores.current.push(opts.stability);
      if (opts?.balance !== undefined) balanceScores.current.push(opts.balance);
      if (opts?.awareness !== undefined) awarenessScores.current.push(opts.awareness);
      if (opts?.regulation !== undefined) regulationScores.current.push(opts.regulation);
      if (opts?.core !== undefined) coreScores.current.push(opts.core);
      if (opts?.holdMs !== undefined) holdTimes.current.push(opts.holdMs);
    },
    [],
  );

  const recordError = useCallback(() => {
    errors.current += 1;
  }, []);

  const avg = (arr: number[]) =>
    arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const snapshot = useCallback((): PostureAnalyticsSnapshot => {
    const postureAccuracy = avg(postureScores.current);
    const holdDurationScore = avg(holdScores.current);
    const stabilityScore = avg(stabilityScores.current);
    const balanceScore = avg(balanceScores.current);
    const bodyAwarenessScore = avg(awarenessScores.current);
    const selfRegulationScore = avg(regulationScores.current);
    const coreControlScore = avg(coreScores.current);
    const total = correct.current + errors.current;
    const base = total > 0 ? Math.round((correct.current / total) * 100) : 0;
    const posturalControlRating =
      Math.round(
        (postureAccuracy +
          holdDurationScore +
          stabilityScore +
          balanceScore +
          bodyAwarenessScore +
          selfRegulationScore +
          coreControlScore +
          base) /
          8,
      ) || base;

    return {
      correctCount: correct.current,
      errorCount: errors.current,
      postureAccuracy: postureAccuracy || base,
      holdDurationScore,
      stabilityScore,
      balanceScore,
      bodyAwarenessScore: bodyAwarenessScore || base,
      selfRegulationScore,
      coreControlScore,
      avgHoldMs: avg(holdTimes.current),
      posturalControlRating,
      durationMs: Date.now() - sessionStart.current,
    };
  }, []);

  const metaPayload = useCallback(() => {
    const s = snapshot();
    return {
      postureAnalytics: s,
      postureAccuracy: s.postureAccuracy,
      holdDurationScore: s.holdDurationScore,
      stabilityScore: s.stabilityScore,
      balanceScore: s.balanceScore,
      bodyAwarenessScore: s.bodyAwarenessScore,
      selfRegulationScore: s.selfRegulationScore,
      posturalControlRating: s.posturalControlRating,
      avgHoldMs: s.avgHoldMs,
    };
  }, [snapshot]);

  return {
    reset,
    startRound,
    recordSuccess,
    recordError,
    snapshot,
    metaPayload,
  };
};
