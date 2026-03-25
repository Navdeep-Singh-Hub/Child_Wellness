// Notebook Task Page
import NotebookTask from '@/components/game/scribbling/components/NotebookTask';
import { useRouter } from 'expo-router';
import React from 'react';

export default function NotebookPage() {
  const router = useRouter();

  const handleComplete = (result: { scribble: boolean; circle: boolean; colored: boolean }) => {
    router.push({
      pathname: '/level-1/session-1/result',
      params: {
        correct: result.scribble && result.circle && result.colored ? '1' : '0',
        total: '1',
        accuracy: result.scribble && result.circle && result.colored ? '100' : '0',
        gameId: 'notebook',
      },
    });
  };

  const handleBack = () => {
    router.back();
  };

  return <NotebookTask onComplete={handleComplete} onBack={handleBack} />;
}
