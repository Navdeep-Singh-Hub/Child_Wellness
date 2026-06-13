/**
 * Therapist analytics for OT Level 3 Session 8 body awareness games.
 */
import { useCallback, useRef } from 'react';

export type BodyAnalyticsSnapshot = {
  correctCount: number;
  errorCount: number;
  bodyPartAccuracy: number;
  leftRightAccuracy: number;
  bodyMappingScore: number;
  visualScanningScore: number;
  sequenceMemoryScore: number;
  spatialPlacementScore: number;
  avgReactionMs: number;
  bodyAwarenessScore: number;
  durationMs: number;
};

export function useBodyAnalytics() {
  const sessionStart = useRef(Date.now());
  const correct = useRef(0);
  const errors = useRef(0);
  const partScores = useRef<number[]>([]);
  const lateralScores = useRef<number[]>([]);
  const mappingScores = useRef<number[]>([]);
  const scanningScores = useRef<number[]>([]);
  const memoryScores = useRef<number[]>([]);
  const spatialScores = useRef<number[]>([]);
  const reactions = useRef<number[]>([]);
  const roundStart = useRef(Date.now());

  const reset = useCallback(() => {
    sessionStart.current = Date.now();
    correct.current = 0;
    errors.current = 0;
    partScores.current = [];
    lateralScores.current = [];
    mappingScores.current = [];
    scanningScores.current = [];
    memoryScores.current = [];
    spatialScores.current = [];
    reactions.current = [];
    roundStart.current = Date.now();
  }, []);

  const startRound = useCallback(() => {
    roundStart.current = Date.now();
  }, []);

  const recordSuccess = useCallback(
    (opts?: {
      part?: number;
      lateral?: number;
      mapping?: number;
      scanning?: number;
      memory?: number;
      spatial?: number;
    }) => {
      correct.current += 1;
      reactions.current.push(Date.now() - roundStart.current);
      if (opts?.part !== undefined) partScores.current.push(opts.part);
      if (opts?.lateral !== undefined) lateralScores.current.push(opts.lateral);
      if (opts?.mapping !== undefined) mappingScores.current.push(opts.mapping);
      if (opts?.scanning !== undefined) scanningScores.current.push(opts.scanning);
      if (opts?.memory !== undefined) memoryScores.current.push(opts.memory);
      if (opts?.spatial !== undefined) spatialScores.current.push(opts.spatial);
    },
    [],
  );

  const recordError = useCallback(() => {
    errors.current += 1;
  }, []);

  const avg = (arr: number[]) =>
    arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const snapshot = useCallback((): BodyAnalyticsSnapshot => {
    const bodyPartAccuracy = avg(partScores.current);
    const leftRightAccuracy = avg(lateralScores.current);
    const bodyMappingScore = avg(mappingScores.current);
    const visualScanningScore = avg(scanningScores.current);
    const sequenceMemoryScore = avg(memoryScores.current);
    const spatialPlacementScore = avg(spatialScores.current);
    const total = correct.current + errors.current;
    const baseAccuracy = total > 0 ? Math.round((correct.current / total) * 100) : 0;
    const bodyAwarenessScore =
      Math.round(
        (bodyPartAccuracy +
          leftRightAccuracy +
          bodyMappingScore +
          visualScanningScore +
          sequenceMemoryScore +
          spatialPlacementScore +
          baseAccuracy) /
          7,
      ) || baseAccuracy;

    return {
      correctCount: correct.current,
      errorCount: errors.current,
      bodyPartAccuracy,
      leftRightAccuracy,
      bodyMappingScore,
      visualScanningScore,
      sequenceMemoryScore,
      spatialPlacementScore,
      avgReactionMs:
        reactions.current.length > 0
          ? Math.round(reactions.current.reduce((a, b) => a + b, 0) / reactions.current.length)
          : 0,
      bodyAwarenessScore,
      durationMs: Date.now() - sessionStart.current,
    };
  }, []);

  const metaPayload = useCallback(() => {
    const s = snapshot();
    return {
      bodyAnalytics: s,
      bodyPartAccuracy: s.bodyPartAccuracy,
      leftRightAccuracy: s.leftRightAccuracy,
      bodyMappingScore: s.bodyMappingScore,
      visualScanningScore: s.visualScanningScore,
      sequenceMemoryScore: s.sequenceMemoryScore,
      bodyAwarenessScore: s.bodyAwarenessScore,
      avgReactionMs: s.avgReactionMs,
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
