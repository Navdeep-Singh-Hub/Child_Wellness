// Game route handler for Curved Letters
import LetterIntroductionGame from '@/components/game/curved-letters/games/LetterIntroductionGame';
import TapCorrectLetterGame from '@/components/game/curved-letters/games/TapCorrectLetterGame';
import TraceTheLetterGame from '@/components/game/curved-letters/games/TraceTheLetterGame';
import MatchCurvedLettersGame from '@/components/game/curved-letters/games/MatchCurvedLettersGame';
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
      pathname: '/level-1/session-7/result',
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
    case 'tap-correct-letter':
      return <TapCorrectLetterGame onComplete={handleComplete} onBack={handleBack} />;
    case 'trace-the-letter':
      return <TraceTheLetterGame onComplete={handleComplete} onBack={handleBack} />;
    case 'match-curved-letters':
      return <MatchCurvedLettersGame onComplete={handleComplete} onBack={handleBack} />;
    default:
      return null;
  }
}
