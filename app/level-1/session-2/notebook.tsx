// Notebook Task Page
import NotebookTask from '@/components/game/standing-lines/components/NotebookTask';
import { useRouter } from 'expo-router';
import React from 'react';

export default function NotebookPage() {
  const router = useRouter();

  const handleComplete = (result: { verticalLines: boolean; lineCount: number }) => {
    router.push({
      pathname: '/level-1/session-2/result',
      params: {
        correct: result.verticalLines && result.lineCount >= 3 ? '1' : '0',
        total: '1',
        accuracy: result.verticalLines && result.lineCount >= 3 ? '100' : '0',
        gameId: 'notebook',
      },
    });
  };

  const handleBack = () => {
    router.back();
  };

  return <NotebookTask onComplete={handleComplete} onBack={handleBack} />;
}
