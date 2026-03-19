'use client';

import { useCallback, useState } from 'react';

export interface GameScore {
  correct: number;
  total: number;
  accuracy: number;
}

export function useScoreTracking() {
  const [scores, setScores] = useState<Record<number, GameScore>>({});
  const [gamesCompleted, setGamesCompleted] = useState<Set<number>>(new Set());

  const recordGame = useCallback((gameId: number, correct: number, total: number) => {
    setScores((prev) => ({
      ...prev,
      [gameId]: {
        correct,
        total,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      },
    }));
    setGamesCompleted((prev) => new Set(prev).add(gameId));
  }, []);

  const completedCount = gamesCompleted.size;
  const totalAccuracy =
    Object.values(scores).length > 0
      ? Math.round(
          Object.values(scores).reduce((a, s) => a + s.accuracy, 0) /
            Object.values(scores).length
        )
      : 0;

  return {
    scores,
    gamesCompleted,
    completedCount,
    totalAccuracy,
    recordGame,
  };
}
