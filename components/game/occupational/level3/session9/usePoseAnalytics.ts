/**
 * Therapist analytics for OT Level 3 Session 9 pose imitation games.
 */
import { useCallback, useRef } from 'react';

export type PoseAnalyticsSnapshot = {
  correctCount: number;
  errorCount: number;
  poseAccuracy: number;
  imitationScore: number;
  leftRightAccuracy: number;
  sequenceMemoryScore: number;
  workingMemoryScore: number;
  delayedRecallScore: number;
  avgReactionMs: number;
  motorPlanningScore: number;
  durationMs: number;
};

export function usePoseAnalytics() {
  const sessionStart = useRef(Date.now());
  const correct = useRef(0);
  const errors = useRef(0);
  const poseScores = useRef<number[]>([]);
  const imitationScores = useRef<number[]>([]);
  const lateralScores = useRef<number[]>([]);
  const sequenceScores = useRef<number[]>([]);
  const memoryScores = useRef<number[]>([]);
  const delayedScores = useRef<number[]>([]);
  const motorScores = useRef<number[]>([]);
  const reactions = useRef<number[]>([]);
  const roundStart = useRef(Date.now());

  const reset = useCallback(() => {
    sessionStart.current = Date.now();
    correct.current = 0;
    errors.current = 0;
    poseScores.current = [];
    imitationScores.current = [];
    lateralScores.current = [];
    sequenceScores.current = [];
    memoryScores.current = [];
    delayedScores.current = [];
    motorScores.current = [];
    reactions.current = [];
    roundStart.current = Date.now();
  }, []);

  const startRound = useCallback(() => {
    roundStart.current = Date.now();
  }, []);

  const recordSuccess = useCallback(
    (opts?: {
      pose?: number;
      imitation?: number;
      lateral?: number;
      sequence?: number;
      memory?: number;
      delayed?: number;
      motor?: number;
    }) => {
      correct.current += 1;
      reactions.current.push(Date.now() - roundStart.current);
      if (opts?.pose !== undefined) poseScores.current.push(opts.pose);
      if (opts?.imitation !== undefined) imitationScores.current.push(opts.imitation);
      if (opts?.lateral !== undefined) lateralScores.current.push(opts.lateral);
      if (opts?.sequence !== undefined) sequenceScores.current.push(opts.sequence);
      if (opts?.memory !== undefined) memoryScores.current.push(opts.memory);
      if (opts?.delayed !== undefined) delayedScores.current.push(opts.delayed);
      if (opts?.motor !== undefined) motorScores.current.push(opts.motor);
    },
    [],
  );

  const recordError = useCallback(() => {
    errors.current += 1;
  }, []);

  const avg = (arr: number[]) =>
    arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const snapshot = useCallback((): PoseAnalyticsSnapshot => {
    const poseAccuracy = avg(poseScores.current);
    const imitationScore = avg(imitationScores.current);
    const leftRightAccuracy = avg(lateralScores.current);
    const sequenceMemoryScore = avg(sequenceScores.current);
    const workingMemoryScore = avg(memoryScores.current);
    const delayedRecallScore = avg(delayedScores.current);
    const motorPlanningScore = avg(motorScores.current);
    const total = correct.current + errors.current;
    const base = total > 0 ? Math.round((correct.current / total) * 100) : 0;

    return {
      correctCount: correct.current,
      errorCount: errors.current,
      poseAccuracy: poseAccuracy || base,
      imitationScore: imitationScore || base,
      leftRightAccuracy,
      sequenceMemoryScore,
      workingMemoryScore,
      delayedRecallScore,
      motorPlanningScore,
      avgReactionMs:
        reactions.current.length > 0
          ? Math.round(reactions.current.reduce((a, b) => a + b, 0) / reactions.current.length)
          : 0,
      durationMs: Date.now() - sessionStart.current,
    };
  }, []);

  const metaPayload = useCallback(() => {
    const s = snapshot();
    return {
      poseAnalytics: s,
      poseAccuracy: s.poseAccuracy,
      imitationScore: s.imitationScore,
      leftRightAccuracy: s.leftRightAccuracy,
      sequenceMemoryScore: s.sequenceMemoryScore,
      workingMemoryScore: s.workingMemoryScore,
      delayedRecallScore: s.delayedRecallScore,
      motorPlanningScore: s.motorPlanningScore,
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
