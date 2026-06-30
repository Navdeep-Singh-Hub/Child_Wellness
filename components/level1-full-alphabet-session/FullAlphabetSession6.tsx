/**
 * Level 1 – Session 6: Full A–Z Tracing — A–Z Expedition
 */
import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { GuidedLetterTracingGame } from './GuidedLetterTracingGame';
import { HandHoldingTraceGame } from './HandHoldingTraceGame';
import { LetterRepeatPracticeGame } from './LetterRepeatPracticeGame';
import { TraceSoundGame } from './TraceSoundGame';
import { AlphabetUploadTask } from './AlphabetUploadTask';
import { Session6IntroScreen } from './session-hub-s6/Session6IntroScreen';
import { Session6CompleteScreen } from './session-hub-s6/Session6CompleteScreen';

const TOTAL_STEPS = 5;

interface Props {
  onExit?: () => void;
}

export function FullAlphabetSession6({ onExit }: Props = {}) {
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
      <Session6IntroScreen
        totalSteps={TOTAL_STEPS}
        completedSteps={completedSteps}
        onExit={onExit}
        onSelectStudio={setStep}
      />
    );
  }

  if (step === 6) {
    return (
      <Session6CompleteScreen
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
        <GuidedLetterTracingGame currentStep={1} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={() => markComplete(1)} />
      )}
      {step === 2 && (
        <HandHoldingTraceGame currentStep={2} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={() => markComplete(2)} />
      )}
      {step === 3 && (
        <LetterRepeatPracticeGame currentStep={3} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={() => markComplete(3)} />
      )}
      {step === 4 && (
        <TraceSoundGame currentStep={4} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={() => markComplete(4)} />
      )}
      {step === 5 && (
        <AlphabetUploadTask currentStep={5} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={handleTaskComplete} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});
