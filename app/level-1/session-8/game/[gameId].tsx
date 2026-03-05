// Game route handler for The Citizen
import ReadSignGame from '@/components/game/citizen/games/ReadSignGame';
import WhereDoYouSeeGame from '@/components/game/citizen/games/WhereDoYouSeeGame';
import CoinRecognitionGame from '@/components/game/citizen/games/CoinRecognitionGame';
import CountCoinsGame from '@/components/game/citizen/games/CountCoinsGame';
import MiniShopGame from '@/components/game/citizen/games/MiniShopGame';
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
      pathname: '/level-1/session-8/result',
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
    case 'read-sign':
      return <ReadSignGame onComplete={handleComplete} onBack={handleBack} />;
    case 'where-do-you-see':
      return <WhereDoYouSeeGame onComplete={handleComplete} onBack={handleBack} />;
    case 'coin-recognition':
      return <CoinRecognitionGame onComplete={handleComplete} onBack={handleBack} />;
    case 'count-coins':
      return <CountCoinsGame onComplete={handleComplete} onBack={handleBack} />;
    case 'mini-shop':
      return <MiniShopGame onComplete={handleComplete} onBack={handleBack} />;
    default:
      return null;
  }
}
