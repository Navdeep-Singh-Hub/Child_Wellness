// Notebook Task Page
import NotebookTask from '@/components/game/standing-line-letters/components/NotebookTask';
import { useRouter } from 'expo-router';
import React from 'react';

export default function NotebookPage() {
  const router = useRouter();

  const handleComplete = (result: { verticalStrokes: boolean; letterI: boolean; letterL: boolean; letterCount: number }) => {
    router.push({
      pathname: '/level-1/session-6/result',
      params: {
        correct: result.verticalStrokes && result.letterCount >= 3 ? '1' : '0',
        total: '1',
        accuracy: result.verticalStrokes && result.letterCount >= 3 ? '100' : '0',
        gameId: 'notebook',
      },
    });
  };

  const handleBack = () => {
    router.back();
  };

  return <NotebookTask onComplete={handleComplete} onBack={handleBack} />;
}
