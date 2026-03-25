// Notebook Task Page
import NotebookTask from '@/components/game/explorer-final/components/NotebookTask';
import { useRouter } from 'expo-router';
import React from 'react';

export default function NotebookPage() {
  const router = useRouter();

  const handleComplete = (result: { lettersDetected: boolean; numbersDetected: boolean }) => {
    router.push({
      pathname: '/level-1/session-10/result',
      params: {
        correct: result.lettersDetected && result.numbersDetected ? '1' : '0',
        total: '1',
        accuracy: result.lettersDetected && result.numbersDetected ? '100' : '0',
        gameId: 'notebook',
      },
    });
  };

  const handleBack = () => {
    router.back();
  };

  return <NotebookTask onComplete={handleComplete} onBack={handleBack} />;
}
