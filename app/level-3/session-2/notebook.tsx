// Notebook Task Page
import NotebookTaskScreen from '@/components/game/builder-session2/components/NotebookTaskScreen';
import UploadScreen from '@/components/game/builder-session2/components/UploadScreen';
import ResultScreen from '@/components/game/builder-session2/components/ResultScreen';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';

export default function NotebookPage() {
  const router = useRouter();
  const [step, setStep] = useState<'instructions' | 'upload' | 'result'>('instructions');
  const [notebookResult, setNotebookResult] = useState<{ batWordDetected: boolean; squareDetected: boolean; batDrawingDetected: boolean } | null>(null);

  const handleContinue = () => {
    setStep('upload');
  };

  const handleUploadComplete = (result: { batWordDetected: boolean; squareDetected: boolean; batDrawingDetected: boolean }) => {
    setNotebookResult(result);
    setStep('result');
  };

  const handleBack = () => {
    if (step === 'instructions') {
      router.back();
    } else if (step === 'upload') {
      setStep('instructions');
    } else {
      router.push('/level-3/session-2');
    }
  };

  if (step === 'instructions') {
    return <NotebookTaskScreen onContinue={handleContinue} onBack={handleBack} />;
  }

  if (step === 'upload') {
    return <UploadScreen onComplete={handleUploadComplete} onBack={handleBack} />;
  }

  return (
    <ResultScreen
      gamesCompleted={4}
      notebookResult={notebookResult}
      onBack={handleBack}
    />
  );
}
