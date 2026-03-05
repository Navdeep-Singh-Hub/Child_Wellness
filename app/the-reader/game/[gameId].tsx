// Game route handler for The Reader
import BuildSentenceGame from '@/components/game/reader/games/BuildSentenceGame';
import ArrangeSentenceGame from '@/components/game/reader/games/ArrangeSentenceGame';
import TakeAwayGame from '@/components/game/reader/games/TakeAwayGame';
import SubtractionBuilderGame from '@/components/game/reader/games/SubtractionBuilderGame';
import ReadingSubtractionMixGame from '@/components/game/reader/games/ReadingSubtractionMixGame';
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
      pathname: '/the-reader/result',
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
    case 'build-sentence':
      return <BuildSentenceGame onComplete={handleComplete} onBack={handleBack} />;
    case 'arrange-sentence':
      return <ArrangeSentenceGame onComplete={handleComplete} onBack={handleBack} />;
    case 'take-away':
      return <TakeAwayGame onComplete={handleComplete} onBack={handleBack} />;
    case 'subtraction-builder':
      return <SubtractionBuilderGame onComplete={handleComplete} onBack={handleBack} />;
    case 'reading-subtraction-mix':
      return <ReadingSubtractionMixGame onComplete={handleComplete} onBack={handleBack} />;
    default:
      return null;
  }
}
