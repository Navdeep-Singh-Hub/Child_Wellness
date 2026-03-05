// Game route handler for The Graduate
import ArrangeStoryGame from '@/components/game/graduate/games/ArrangeStoryGame';
import CompleteDialogueGame from '@/components/game/graduate/games/CompleteDialogueGame';
import WordProblemAdditionGame from '@/components/game/graduate/games/WordProblemAdditionGame';
import WordProblemSubtractionGame from '@/components/game/graduate/games/WordProblemSubtractionGame';
import GraduateChallengeGame from '@/components/game/graduate/games/GraduateChallengeGame';
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
      pathname: '/level-1/session-10/result',
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
    case 'arrange-story':
      return <ArrangeStoryGame onComplete={handleComplete} onBack={handleBack} />;
    case 'complete-dialogue':
      return <CompleteDialogueGame onComplete={handleComplete} onBack={handleBack} />;
    case 'word-problem-addition':
      return <WordProblemAdditionGame onComplete={handleComplete} onBack={handleBack} />;
    case 'word-problem-subtraction':
      return <WordProblemSubtractionGame onComplete={handleComplete} onBack={handleBack} />;
    case 'graduate-challenge':
      return <GraduateChallengeGame onComplete={handleComplete} onBack={handleBack} />;
    default:
      return null;
  }
}
