// Game route handler for Standing Line Letters
import LetterIntroductionGame from '@/components/game/standing-line-letters/games/LetterIntroductionGame';
import TapTheLetterGame from '@/components/game/standing-line-letters/games/TapTheLetterGame';
import TraceTheLetterGame from '@/components/game/standing-line-letters/games/TraceTheLetterGame';
import FindTheLetterGame from '@/components/game/standing-line-letters/games/FindTheLetterGame';
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
      pathname: '/level-1/session-6/result',
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
    case 'letter-introduction':
      return <LetterIntroductionGame onComplete={handleComplete} onBack={handleBack} />;
    case 'tap-the-letter':
      return <TapTheLetterGame onComplete={handleComplete} onBack={handleBack} />;
    case 'trace-the-letter':
      return <TraceTheLetterGame onComplete={handleComplete} onBack={handleBack} />;
    case 'find-the-letter':
      return <FindTheLetterGame onComplete={handleComplete} onBack={handleBack} />;
    default:
      return null;
  }
}
