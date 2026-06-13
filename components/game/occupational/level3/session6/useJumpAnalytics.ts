/**
 * Therapist analytics for OT Level 3 Session 6 jump imitation games.
 */
import { useCallback, useRef } from 'react';
import type { TapGrade } from '@/components/game/occupational/level3/session6/jumpUtils';

export type JumpAnalyticsSnapshot = {
  correctCount: number;
  errorCount: number;
  doubleTapAccuracy: number;
  inhibitionScore: number;
  rhythmConsistency: number;
  sequencingScore: number;
  motorPlanningScore: number;
  avgReactionMs: number;
  jumpMasteryScore: number;
  durationMs: number;
};

export function useJumpAnalytics() {
  const sessionStart = useRef(Date.now());
  const correct = useRef(0);
  const errors = useRef(0);
  const doubleTapScores = useRef<number[]>([]);
  const inhibitionScores = useRef<number[]>([]);
  const rhythmScores = useRef<number[]>([]);
  const sequencingScores = useRef<number[]>([]);
  const motorScores = useRef<number[]>([]);
  const reactions = useRef<number[]>([]);
  const roundStart = useRef(Date.now());

  const reset = useCallback(() => {
    sessionStart.current = Date.now();
    correct.current = 0;
    errors.current = 0;
    doubleTapScores.current = [];
    inhibitionScores.current = [];
    rhythmScores.current = [];
    sequencingScores.current = [];
    motorScores.current = [];
    reactions.current = [];
    roundStart.current = Date.now();
  }, []);

  const startRound = useCallback(() => {
    roundStart.current = Date.now();
  }, []);

  const recordSuccess = useCallback(
    (opts?: {
      doubleTapScore?: number;
      inhibition?: number;
      rhythm?: number;
      sequencing?: number;
      motor?: number;
    }) => {
      correct.current += 1;
      reactions.current.push(Date.now() - roundStart.current);
      if (opts?.doubleTapScore !== undefined) doubleTapScores.current.push(opts.doubleTapScore);
      if (opts?.inhibition !== undefined) inhibitionScores.current.push(opts.inhibition);
      if (opts?.rhythm !== undefined) rhythmScores.current.push(opts.rhythm);
      if (opts?.sequencing !== undefined) sequencingScores.current.push(opts.sequencing);
      if (opts?.motor !== undefined) motorScores.current.push(opts.motor);
    },
    [],
  );

  const recordError = useCallback((opts?: { inhibitionFail?: boolean }) => {
    errors.current += 1;
    if (opts?.inhibitionFail) inhibitionScores.current.push(0);
  }, []);

  const recordTiming = useCallback((_grade: TapGrade, reactionMs?: number) => {
    if (reactionMs !== undefined && reactionMs >= 0) reactions.current.push(reactionMs);
  }, []);

  const avg = (arr: number[]) =>
    arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const snapshot = useCallback((): JumpAnalyticsSnapshot => {
    const doubleTapAccuracy = avg(doubleTapScores.current);
    const inhibitionScore = avg(inhibitionScores.current);
    const rhythmConsistency = avg(rhythmScores.current);
    const sequencingScore = avg(sequencingScores.current);
    const motorPlanningScore = avg(motorScores.current);
    const total = correct.current + errors.current;
    const baseAccuracy = total > 0 ? Math.round((correct.current / total) * 100) : 0;
    const jumpMasteryScore =
      Math.round(
        (doubleTapAccuracy +
          inhibitionScore +
          rhythmConsistency +
          sequencingScore +
          motorPlanningScore +
          baseAccuracy) /
          6,
      ) || baseAccuracy;

    return {
      correctCount: correct.current,
      errorCount: errors.current,
      doubleTapAccuracy,
      inhibitionScore,
      rhythmConsistency,
      sequencingScore,
      motorPlanningScore,
      avgReactionMs:
        reactions.current.length > 0
          ? Math.round(reactions.current.reduce((a, b) => a + b, 0) / reactions.current.length)
          : 0,
      jumpMasteryScore,
      durationMs: Date.now() - sessionStart.current,
    };
  }, []);

  const metaPayload = useCallback(() => {
    const s = snapshot();
    return {
      jumpAnalytics: s,
      doubleTapAccuracy: s.doubleTapAccuracy,
      inhibitionScore: s.inhibitionScore,
      rhythmConsistency: s.rhythmConsistency,
      sequencingScore: s.sequencingScore,
      motorPlanningScore: s.motorPlanningScore,
      jumpMasteryScore: s.jumpMasteryScore,
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
