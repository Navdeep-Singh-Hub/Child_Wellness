// Game route handler for The Builder Session 2
import WordIntroScreen from '@/components/game/builder-session2/games/WordIntroScreen';
import ChooseWordGameScreen from '@/components/game/builder-session2/games/ChooseWordGameScreen';
import BuildWordGameScreen from '@/components/game/builder-session2/games/BuildWordGameScreen';
import ShapeMatchGameScreen from '@/components/game/builder-session2/games/ShapeMatchGameScreen';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';

export default function GameScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();
  const router = useRouter();
  const [gamesCompleted, setGamesCompleted] = useState(0);

  const handleWordIntroComplete = () => {
    router.push('/level-3/session-2/game/choose-word');
  };

  const handleGameComplete = (stats: {
    correct: number;
    total: number;
    accuracy: number;
    gameId: string;
  }) => {
    setGamesCompleted((prev) => prev + 1);
    // Navigate to next game or result
    if (gameId === 'word-intro') {
      router.push('/level-3/session-2/game/choose-word');
    } else if (gameId === 'choose-word') {
      router.push('/level-3/session-2/game/build-word');
    } else if (gameId === 'build-word') {
      router.push('/level-3/session-2/game/shape-match');
    } else if (gameId === 'shape-match') {
      router.push('/level-3/session-2/notebook');
    }
  };

  const handleBack = () => {
    router.back();
  };

  switch (gameId) {
    case 'word-intro':
      return <WordIntroScreen onComplete={handleWordIntroComplete} onBack={handleBack} />;
    case 'choose-word':
      return <ChooseWordGameScreen onComplete={handleGameComplete} onBack={handleBack} />;
    case 'build-word':
      return <BuildWordGameScreen onComplete={handleGameComplete} onBack={handleBack} />;
    case 'shape-match':
      return <ShapeMatchGameScreen onComplete={handleGameComplete} onBack={handleBack} />;
    default:
      return null;
  }
}
