/**
 * Level 1 – Session 4: Straight-Line Letters — Letter Forge
 * Flow: Hub Intro → 5 Studios → Session Complete
 */
import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LetterIntroductionGame } from './LetterIntroductionGame';
import { LetterRecognitionGame } from './LetterRecognitionGame';
import { BuildLetterGame } from './BuildLetterGame';
import { DottedLetterTracingGame } from './DottedLetterTracingGame';
import { LetterUploadTask } from './LetterUploadTask';
import { Session4IntroScreen } from './session-hub-s4/Session4IntroScreen';
import { Session4CompleteScreen } from './session-hub-s4/Session4CompleteScreen';

const TOTAL_STEPS = 5;

interface StraightLineLettersSession4Props {
  onExit?: () => void;
}

export function StraightLineLettersSession4({ onExit }: StraightLineLettersSession4Props = {}) {
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
      <Session4IntroScreen
        totalSteps={TOTAL_STEPS}
        completedSteps={completedSteps}
        onExit={onExit}
        onSelectStudio={setStep}
      />
    );
  }

  if (step === 6) {
    return (
      <Session4CompleteScreen
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
        <LetterIntroductionGame currentStep={1} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={() => markComplete(1)} />
      )}
      {step === 2 && (
        <LetterRecognitionGame currentStep={2} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={() => markComplete(2)} />
      )}
      {step === 3 && (
        <BuildLetterGame currentStep={3} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={() => markComplete(3)} />
      )}
      {step === 4 && (
        <DottedLetterTracingGame currentStep={4} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={() => markComplete(4)} />
      )}
      {step === 5 && (
        <LetterUploadTask currentStep={5} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={handleTaskComplete} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});
