/**
 * Level 1 – Session 8: Copy Letters — Scribe's Gallery
 */
import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SideBySideWritingGame } from './SideBySideWritingGame';
import { MemoryCopyGame } from './MemoryCopyGame';
import { MultiLetterCopyGame } from './MultiLetterCopyGame';
import { CopyLettersUploadTask } from './CopyLettersUploadTask';
import { Session8IntroScreen } from './session-hub-s8/Session8IntroScreen';
import { Session8CompleteScreen } from './session-hub-s8/Session8CompleteScreen';

const TOTAL_STEPS = 4;

interface Props {
  onExit?: () => void;
}

export function CopyLettersSession8({ onExit }: Props = {}) {
  const [step, setStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [taskSuccess, setTaskSuccess] = useState<boolean | null>(null);

  const markComplete = useCallback((gameStep: number) => {
    setCompletedSteps((prev) => new Set([...prev, gameStep]));
    setStep(gameStep < TOTAL_STEPS ? gameStep + 1 : 5);
  }, []);

  const handleTaskComplete = useCallback((success: boolean) => {
    setTaskSuccess(success);
    if (success) {
      setCompletedSteps((prev) => new Set([...prev, 4]));
      setStep(5);
    }
  }, []);

  if (step === 0) {
    return (
      <Session8IntroScreen
        totalSteps={TOTAL_STEPS}
        completedSteps={completedSteps}
        onExit={onExit}
        onSelectStudio={setStep}
      />
    );
  }

  if (step === 5) {
    return (
      <Session8CompleteScreen
        completed={completedSteps.size}
        totalSteps={TOTAL_STEPS}
        taskSuccess={taskSuccess}
        onExit={onExit}
      />
    );
  }

  const goBack = () => setStep(0);

  return (
    <View style={styles.safe}>
      {step === 1 && (
        <SideBySideWritingGame currentStep={1} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={() => markComplete(1)} />
      )}
      {step === 2 && (
        <MemoryCopyGame currentStep={2} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={() => markComplete(2)} />
      )}
      {step === 3 && (
        <MultiLetterCopyGame currentStep={3} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={() => markComplete(3)} />
      )}
      {step === 4 && (
        <CopyLettersUploadTask currentStep={4} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={handleTaskComplete} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});
