// Game route handler for Scribbling & Gripping
import FreeScribbleGame from '@/components/game/scribbling/games/FreeScribbleGame';
import ColorPictureGame from '@/components/game/scribbling/games/ColorPictureGame';
import ScribbleInsideShapeGame from '@/components/game/scribbling/games/ScribbleInsideShapeGame';
import JoinDotsGame from '@/components/game/scribbling/games/JoinDotsGame';
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
      pathname: '/level-1/session-1/result',
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
    case 'free-scribble':
      return <FreeScribbleGame onComplete={handleComplete} onBack={handleBack} />;
    case 'color-picture':
      return <ColorPictureGame onComplete={handleComplete} onBack={handleBack} />;
    case 'scribble-inside-shape':
      return <ScribbleInsideShapeGame onComplete={handleComplete} onBack={handleBack} />;
    case 'join-dots':
      return <JoinDotsGame onComplete={handleComplete} onBack={handleBack} />;
    default:
      return null;
  }
}
