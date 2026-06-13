/**
 * Therapist analytics for OT Level 3 Session 3 tempo games.
 */
import { useCallback, useRef } from 'react';
import type { TempoGrade } from '@/components/game/occupational/level3/session3/tempoUtils';

export type TempoAnalyticsSnapshot = {
  perfectCount: number;
  goodCount: number;
  missCount: number;
  earlyResponses: number;
  lateResponses: number;
  impulseErrors: number;
  avgReactionMs: number;
  tempoAccuracy: number;
  rhythmConsistency: number;
  speedMatchAccuracy: number;
  motorRegulationScore: number;
  durationMs: number;
};

export function useTempoAnalytics() {
  const sessionStart = useRef(Date.now());
  const perfect = useRef(0);
  const good = useRef(0);
  const miss = useRef(0);
  const early = useRef(0);
  const late = useRef(0);
  const impulse = useRef(0);
  const reactions = useRef<number[]>([]);
  const speedMatchScores = useRef<number[]>([]);
  const roundStart = useRef(Date.now());

  const reset = useCallback(() => {
    sessionStart.current = Date.now();
    perfect.current = 0;
    good.current = 0;
    miss.current = 0;
    early.current = 0;
    late.current = 0;
    impulse.current = 0;
    reactions.current = [];
    speedMatchScores.current = [];
    roundStart.current = Date.now();
  }, []);

  const startRound = useCallback(() => {
    roundStart.current = Date.now();
  }, []);

  const recordGrade = useCallback((grade: TempoGrade, reactionMs?: number) => {
    if (grade === 'perfect') perfect.current += 1;
    else if (grade === 'good') good.current += 1;
    else if (grade === 'early') {
      early.current += 1;
      impulse.current += 1;
      miss.current += 1;
    } else if (grade === 'late') {
      late.current += 1;
      miss.current += 1;
    } else miss.current += 1;

    if (reactionMs !== undefined && reactionMs >= 0) reactions.current.push(reactionMs);
  }, []);

  const recordImpulse = useCallback(() => {
    impulse.current += 1;
    miss.current += 1;
  }, []);

  const recordSpeedMatch = useCallback((accuracyPct: number) => {
    speedMatchScores.current.push(accuracyPct);
  }, []);

  const snapshot = useCallback((): TempoAnalyticsSnapshot => {
    const total = perfect.current + good.current + miss.current;
    const rx = reactions.current;
    const avgReactionMs =
      rx.length > 0 ? Math.round(rx.reduce((a, b) => a + b, 0) / rx.length) : 0;
    const tempoAccuracy =
      total > 0 ? Math.round(((perfect.current + good.current * 0.65) / total) * 100) : 0;
    const rhythmConsistency =
      rx.length > 1
        ? Math.max(
            0,
            100 -
              Math.round(
                rx.reduce((sum, t, i) => (i === 0 ? sum : sum + Math.abs(t - rx[i - 1]!)), 0) /
                  (rx.length - 1),
              ),
          )
        : 100;
    const speedMatchAccuracy =
      speedMatchScores.current.length > 0
        ? Math.round(
            speedMatchScores.current.reduce((a, b) => a + b, 0) / speedMatchScores.current.length,
          )
        : 0;
    const motorRegulationScore = Math.round(
      tempoAccuracy * 0.45 +
        rhythmConsistency * 0.25 +
        speedMatchAccuracy * 0.15 +
        Math.max(0, 100 - impulse.current * 8) * 0.15,
    );

    return {
      perfectCount: perfect.current,
      goodCount: good.current,
      missCount: miss.current,
      earlyResponses: early.current,
      lateResponses: late.current,
      impulseErrors: impulse.current,
      avgReactionMs,
      tempoAccuracy,
      rhythmConsistency,
      speedMatchAccuracy,
      motorRegulationScore,
      durationMs: Date.now() - sessionStart.current,
    };
  }, []);

  const metaPayload = useCallback(() => {
    const s = snapshot();
    return {
      tempoAnalytics: s,
      tempoAccuracy: s.tempoAccuracy,
      earlyResponses: s.earlyResponses,
      lateResponses: s.lateResponses,
      impulseErrors: s.impulseErrors,
      rhythmConsistency: s.rhythmConsistency,
      speedMatchAccuracy: s.speedMatchAccuracy,
      motorRegulationScore: s.motorRegulationScore,
      avgReactionMs: s.avgReactionMs,
    };
  }, [snapshot]);

  return {
    reset,
    startRound,
    recordGrade,
    recordImpulse,
    recordSpeedMatch,
    snapshot,
    metaPayload,
  };
};
