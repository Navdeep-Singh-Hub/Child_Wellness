// Game route handler for The Logic Lab
import PlaceItRightGame from '@/components/game/logic-lab/games/PlaceItRightGame';
import ChooseCorrectPictureGame from '@/components/game/logic-lab/games/ChooseCorrectPictureGame';
import CompletePatternGame from '@/components/game/logic-lab/games/CompletePatternGame';
import ArrangeSequenceGame from '@/components/game/logic-lab/games/ArrangeSequenceGame';
import LogicMixChallengeGame from '@/components/game/logic-lab/games/LogicMixChallengeGame';
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
      pathname: '/the-logic-lab/result',
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
    case 'place-it-right':
      return <PlaceItRightGame onComplete={handleComplete} onBack={handleBack} />;
    case 'choose-correct-picture':
      return <ChooseCorrectPictureGame onComplete={handleComplete} onBack={handleBack} />;
    case 'complete-pattern':
      return <CompletePatternGame onComplete={handleComplete} onBack={handleBack} />;
    case 'arrange-sequence':
      return <ArrangeSequenceGame onComplete={handleComplete} onBack={handleBack} />;
    case 'logic-mix-challenge':
      return <LogicMixChallengeGame onComplete={handleComplete} onBack={handleBack} />;
    default:
      return null;
  }
}
