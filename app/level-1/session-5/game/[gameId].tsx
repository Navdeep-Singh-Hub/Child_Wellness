// Game route handler for Curved Lines
import IntroCurvesGame from '@/components/game/curved-lines/games/IntroCurvesGame';
import TraceCurvedLinesGame from '@/components/game/curved-lines/games/TraceCurvedLinesGame';
import FindCurvedShapeGame from '@/components/game/curved-lines/games/FindCurvedShapeGame';
import DragCurvedPiecesGame from '@/components/game/curved-lines/games/DragCurvedPiecesGame';
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
      pathname: '/level-1/session-5/result',
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
    case 'intro-curves':
      return <IntroCurvesGame onComplete={handleComplete} onBack={handleBack} />;
    case 'trace-curved-lines':
      return <TraceCurvedLinesGame onComplete={handleComplete} onBack={handleBack} />;
    case 'find-curved-shape':
      return <FindCurvedShapeGame onComplete={handleComplete} onBack={handleBack} />;
    case 'drag-curved-pieces':
      return <DragCurvedPiecesGame onComplete={handleComplete} onBack={handleBack} />;
    default:
      return null;
  }
}
