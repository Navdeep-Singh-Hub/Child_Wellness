// Notebook Task Page
import NotebookTask from '@/components/game/numbers-1-5/components/NotebookTask';
import { useRouter } from 'expo-router';
import React from 'react';

export default function NotebookPage() {
  const router = useRouter();

  const handleComplete = (result: { numbersDetected: boolean; applesCount: number; starsCount: number }) => {
    const applesMatch = result.applesCount >= 2 && result.applesCount <= 4;
    const starsMatch = result.starsCount >= 4 && result.starsCount <= 6;
    
    router.push({
      pathname: '/level-1/session-8/result',
      params: {
        correct: result.numbersDetected && applesMatch && starsMatch ? '1' : '0',
        total: '1',
        accuracy: result.numbersDetected && applesMatch && starsMatch ? '100' : '0',
        gameId: 'notebook',
      },
    });
  };

  const handleBack = () => {
    router.back();
  };

  return <NotebookTask onComplete={handleComplete} onBack={handleBack} />;
}
