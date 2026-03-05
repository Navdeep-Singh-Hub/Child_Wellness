// Game route handler for The Clockwise
import ReadAnswerGame from '@/components/game/clockwise/games/ReadAnswerGame';
import StoryQuestionGame from '@/components/game/clockwise/games/StoryQuestionGame';
import ReadClockGame from '@/components/game/clockwise/games/ReadClockGame';
import WhichIsBiggerGame from '@/components/game/clockwise/games/WhichIsBiggerGame';
import MixedThinkingGame from '@/components/game/clockwise/games/MixedThinkingGame';
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
      pathname: '/level-1/session-9/result',
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
    case 'read-answer':
      return <ReadAnswerGame onComplete={handleComplete} onBack={handleBack} />;
    case 'story-question':
      return <StoryQuestionGame onComplete={handleComplete} onBack={handleBack} />;
    case 'read-clock':
      return <ReadClockGame onComplete={handleComplete} onBack={handleBack} />;
    case 'which-is-bigger':
      return <WhichIsBiggerGame onComplete={handleComplete} onBack={handleBack} />;
    case 'mixed-thinking':
      return <MixedThinkingGame onComplete={handleComplete} onBack={handleBack} />;
    default:
      return null;
  }
}
