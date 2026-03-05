// Result page for The Logic Lab
import GameCompleteScreen from '@/components/game/logic-lab/components/GameCompleteScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

export default function ResultScreen() {
  const params = useLocalSearchParams<{
    correct: string;
    total: string;
    accuracy: string;
    gameId: string;
  }>();
  const router = useRouter();

  const correct = parseInt(params.correct || '0', 10);
  const total = parseInt(params.total || '0', 10);
  const accuracy = parseFloat(params.accuracy || '0');
  const gameId = params.gameId || '';

  const handleContinue = () => {
    router.push('/the-logic-lab');
  };

  const handleBack = () => {
    router.push('/the-logic-lab');
  };

  return (
    <GameCompleteScreen
      correct={correct}
      total={total}
      accuracy={accuracy}
      gameId={gameId}
      onContinue={handleContinue}
      onBack={handleBack}
    />
  );
}
