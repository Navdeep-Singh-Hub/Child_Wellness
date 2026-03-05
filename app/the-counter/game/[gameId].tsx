// Game route handler for The Counter
import TapSightWordGame from '@/components/game/counter/games/TapSightWordGame';
import FindWordSentenceGame from '@/components/game/counter/games/FindWordSentenceGame';
import CountAddObjectsGame from '@/components/game/counter/games/CountAddObjectsGame';
import BuildAdditionGame from '@/components/game/counter/games/BuildAdditionGame';
import ReadingCountingMixGame from '@/components/game/counter/games/ReadingCountingMixGame';
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
      pathname: '/the-counter/result',
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
    case 'tap-sight-word':
      return <TapSightWordGame onComplete={handleComplete} onBack={handleBack} />;
    case 'find-word-sentence':
      return <FindWordSentenceGame onComplete={handleComplete} onBack={handleBack} />;
    case 'count-add-objects':
      return <CountAddObjectsGame onComplete={handleComplete} onBack={handleBack} />;
    case 'build-addition':
      return <BuildAdditionGame onComplete={handleComplete} onBack={handleBack} />;
    case 'reading-counting-mix':
      return <ReadingCountingMixGame onComplete={handleComplete} onBack={handleBack} />;
    default:
      return null;
  }
}
