/**
 * Level 1 – Session 3: Curved Lines — River Bend Quest
 * Flow: Hub Intro → 3 Studios → Session Complete
 */
import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { CurvedDotLineTracingGame } from './CurvedDotLineTracingGame';
import { FreeCurveDrawingGame } from './FreeCurveDrawingGame';
import { VowelUploadTask } from './VowelUploadTask';
import { Session3IntroScreen } from './session-hub-s3/Session3IntroScreen';
import { Session3CompleteScreen } from './session-hub-s3/Session3CompleteScreen';

const TOTAL_STEPS = 3;

interface CurvesVowelsSession5Props {
  onExit?: () => void;
}

export function CurvesVowelsSession5({ onExit }: CurvesVowelsSession5Props = {}) {
  const [step, setStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [taskSuccess, setTaskSuccess] = useState<boolean | null>(null);

  const markComplete = useCallback((gameStep: number) => {
    setCompletedSteps((prev) => new Set([...prev, gameStep]));
    setStep(gameStep < TOTAL_STEPS ? gameStep + 1 : 4);
  }, []);

  const handleTaskComplete = useCallback((success: boolean) => {
    setTaskSuccess(success);
    if (success) {
      setCompletedSteps((prev) => new Set([...prev, 3]));
      setStep(4);
    }
  }, []);

  if (step === 0) {
    return (
      <Session3IntroScreen
        totalSteps={TOTAL_STEPS}
        completedSteps={completedSteps}
        onExit={onExit}
        onSelectStudio={setStep}
      />
    );
  }

  if (step === 4) {
    return (
      <Session3CompleteScreen
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
        <CurvedDotLineTracingGame currentStep={1} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={() => markComplete(1)} />
      )}
      {step === 2 && (
        <FreeCurveDrawingGame currentStep={2} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={() => markComplete(2)} />
      )}
      {step === 3 && (
        <VowelUploadTask currentStep={3} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={handleTaskComplete} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});
