// Game route handler for Slanting Lines
import IntroSlantingLineGame from '@/components/game/slanting-lines/games/IntroSlantingLineGame';
import TraceSlantingLineGame from '@/components/game/slanting-lines/games/TraceSlantingLineGame';
import MatchTheSlopeGame from '@/components/game/slanting-lines/games/MatchTheSlopeGame';
import DragSlantedSticksGame from '@/components/game/slanting-lines/games/DragSlantedSticksGame';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

export default function GameScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const router = useRouter();

  const handleComplete = (stats: {
    correct: number;
    total: number;
    accuracy: number;
    gameId: string;
  }) => {
    router.push({
      pathname: '/level-1/session-4/result',
      params: {
        correct: stats.correct.toString(),
        total: stats.total.toString(),
        accuracy: stats.accuracy.toString(),
        gameId: stats.gameId,
      },
    });
  };

  const handleBack = () => {
    router.back();
  };

  switch (gameId) {
    case 'intro-slanting-line':
      return <IntroSlantingLineGame onComplete={handleComplete} onBack={handleBack} />;
    case 'trace-slanting-line':
      return <TraceSlantingLineGame onComplete={handleComplete} onBack={handleBack} />;
    case 'match-the-slope':
      return <MatchTheSlopeGame onComplete={handleComplete} onBack={handleBack} />;
    case 'drag-slanted-sticks':
      return <DragSlantedSticksGame onComplete={handleComplete} onBack={handleBack} />;
    default:
      return null;
  }
}
