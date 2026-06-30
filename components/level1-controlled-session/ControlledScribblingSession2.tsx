/**
 * Level 1 – Session 2: Controlled Scribbling — Boundary Quest
 */
import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ScribbleInsideCircleGame } from './ScribbleInsideCircleGame';
import { ScribbleInsideTriangleGame } from './ScribbleInsideTriangleGame';
import { BigSmallShapesFillGame } from './BigSmallShapesFillGame';
import { BoundaryControlGame } from './BoundaryControlGame';
import { ScribbleBoundaryUploadTask } from './ScribbleBoundaryUploadTask';
import { Session2IntroScreen } from './session-hub-s2/Session2IntroScreen';
import { Session2CompleteScreen } from './session-hub-s2/Session2CompleteScreen';

const TOTAL_STEPS = 5;

interface ControlledScribblingSession2Props {
  onExit?: () => void;
}

export function ControlledScribblingSession2({ onExit }: ControlledScribblingSession2Props = {}) {
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
      <Session2IntroScreen
        totalSteps={TOTAL_STEPS}
        completedSteps={completedSteps}
        onExit={onExit}
        onSelectStudio={setStep}
      />
    );
  }

  if (step === 6) {
    return (
      <Session2CompleteScreen
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
        <ScribbleInsideCircleGame currentStep={1} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={() => markComplete(1)} />
      )}
      {step === 2 && (
        <ScribbleInsideTriangleGame currentStep={2} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={() => markComplete(2)} />
      )}
      {step === 3 && (
        <BigSmallShapesFillGame currentStep={3} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={() => markComplete(3)} />
      )}
      {step === 4 && (
        <BoundaryControlGame currentStep={4} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={() => markComplete(4)} />
      )}
      {step === 5 && (
        <ScribbleBoundaryUploadTask currentStep={5} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={handleTaskComplete} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});
