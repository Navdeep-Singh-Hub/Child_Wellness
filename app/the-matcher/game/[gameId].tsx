// Game route handler
import SoundToPictureGame from '@/components/game/matcher/games/SoundToPictureGame';
import LetterToSoundGame from '@/components/game/matcher/games/LetterToSoundGame';
import SoundCountingGame from '@/components/game/matcher/games/SoundCountingGame';
import PicturePairGame from '@/components/game/matcher/games/PicturePairGame';
import RapidMatchGame from '@/components/game/matcher/games/RapidMatchGame';
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
      pathname: '/the-matcher/result',
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
    case 'sound-to-picture':
      return <SoundToPictureGame onComplete={handleComplete} onBack={handleBack} />;
    case 'letter-to-sound':
      return <LetterToSoundGame onComplete={handleComplete} onBack={handleBack} />;
    case 'sound-counting':
      return <SoundCountingGame onComplete={handleComplete} onBack={handleBack} />;
    case 'picture-pair':
      return <PicturePairGame onComplete={handleComplete} onBack={handleBack} />;
    case 'rapid-match':
      return <RapidMatchGame onComplete={handleComplete} onBack={handleBack} />;
    default:
      return null;
  }
}
