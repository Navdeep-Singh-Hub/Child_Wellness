// Game route handler for Sleeping Lines
import IntroSleepingLineGame from '@/components/game/sleeping-lines/games/IntroSleepingLineGame';
import TraceSleepingLineGame from '@/components/game/sleeping-lines/games/TraceSleepingLineGame';
import FindCorrectLineGame from '@/components/game/sleeping-lines/games/FindCorrectLineGame';
import MatchSleepingLinesGame from '@/components/game/sleeping-lines/games/MatchSleepingLinesGame';
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
      pathname: '/level-1/session-3/result',
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
    case 'intro-sleeping-line':
      return <IntroSleepingLineGame onComplete={handleComplete} onBack={handleBack} />;
    case 'trace-sleeping-line':
      return <TraceSleepingLineGame onComplete={handleComplete} onBack={handleBack} />;
    case 'find-correct-line':
      return <FindCorrectLineGame onComplete={handleComplete} onBack={handleBack} />;
    case 'match-sleeping-lines':
      return <MatchSleepingLinesGame onComplete={handleComplete} onBack={handleBack} />;
    default:
      return null;
  }
}
