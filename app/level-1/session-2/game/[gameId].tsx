// Game route handler for Standing Lines
import IntroStandingLineGame from '@/components/game/standing-lines/games/IntroStandingLineGame';
import TraceStandingLineGame from '@/components/game/standing-lines/games/TraceStandingLineGame';
import FindVerticalLineGame from '@/components/game/standing-lines/games/FindVerticalLineGame';
import DragVerticalLinesGame from '@/components/game/standing-lines/games/DragVerticalLinesGame';
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
      pathname: '/level-1/session-2/result',
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
    case 'intro-standing-line':
      return <IntroStandingLineGame onComplete={handleComplete} onBack={handleBack} />;
    case 'trace-standing-line':
      return <TraceStandingLineGame onComplete={handleComplete} onBack={handleBack} />;
    case 'find-vertical-line':
      return <FindVerticalLineGame onComplete={handleComplete} onBack={handleBack} />;
    case 'drag-vertical-lines':
      return <DragVerticalLinesGame onComplete={handleComplete} onBack={handleBack} />;
    default:
      return null;
  }
}
