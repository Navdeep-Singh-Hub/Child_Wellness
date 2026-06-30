/**
 * Level 1 – Session 5: Slant & Curve Letters — Alphabet Odyssey
 */
import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LetterIntroGame } from './LetterIntroGame';
import { LetterIdentifyGame } from './LetterIdentifyGame';
import { BuildLetterAdvGame } from './BuildLetterAdvGame';
import { DottedLetterTraceGame } from './DottedLetterTraceGame';
import { CapitalLetterUploadTask } from './CapitalLetterUploadTask';
import { Session5IntroScreen } from './session-hub-s5/Session5IntroScreen';
import { Session5CompleteScreen } from './session-hub-s5/Session5CompleteScreen';

const TOTAL_STEPS = 5;

interface Props {
  onExit?: () => void;
}

export function SlantCurveLettersSession5({ onExit }: Props = {}) {
  const [step, setStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [taskSuccess, setTaskSuccess] = useState<boolean | null>(null);

  const markComplete = useCallback((gameStep: number) => {
    setCompletedSteps((prev) => new Set([...prev, gameStep]));
    setStep(gameStep < TOTAL_STEPS ? gameStep + 1 : 6);
  }, []);

  const handleTaskComplete = useCallback((success: boolean) => {
    setTaskSuccess(success);
    if (success) {
      setCompletedSteps((prev) => new Set([...prev, 5]));
      setStep(6);
    }
  }, []);

  if (step === 0) {
    return (
      <Session5IntroScreen
        totalSteps={TOTAL_STEPS}
        completedSteps={completedSteps}
        onExit={onExit}
        onSelectStudio={setStep}
      />
    );
  }

  if (step === 6) {
    return (
      <Session5CompleteScreen
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
        <LetterIntroGame currentStep={1} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={() => markComplete(1)} />
      )}
      {step === 2 && (
        <LetterIdentifyGame currentStep={2} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={() => markComplete(2)} />
      )}
      {step === 3 && (
        <BuildLetterAdvGame currentStep={3} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={() => markComplete(3)} />
      )}
      {step === 4 && (
        <DottedLetterTraceGame currentStep={4} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={() => markComplete(4)} />
      )}
      {step === 5 && (
        <CapitalLetterUploadTask currentStep={5} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={handleTaskComplete} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});
