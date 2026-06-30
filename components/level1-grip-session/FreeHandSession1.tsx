/**
 * Level 1 – Session 1: Free Hand Control / Gripping
 * Flow: Hub Intro → 5 Studios → Session Complete
 */
import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { FreeScribblingGame } from './FreeScribblingGame';
import { ColorScribbleFillGame } from './ColorScribbleFillGame';
import { TapToDrawGame } from './TapToDrawGame';
import { FollowLoosePathGame } from './FollowLoosePathGame';
import { ScribbleUploadTask } from './ScribbleUploadTask';
import { SessionIntroScreen } from './session-hub/SessionIntroScreen';
import { SessionCompleteScreen } from './session-hub/SessionCompleteScreen';

const TOTAL_STEPS = 5;

interface FreeHandSession1Props {
  onExit?: () => void;
}

export function FreeHandSession1({ onExit }: FreeHandSession1Props = {}) {
  const [step, setStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [taskSuccess, setTaskSuccess] = useState<boolean | null>(null);

  const markComplete = useCallback((gameStep: number) => {
    setCompletedSteps((prev) => new Set([...prev, gameStep]));
    if (gameStep < TOTAL_STEPS) {
      setStep(gameStep + 1);
    } else {
      setStep(6);
    }
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
      <SessionIntroScreen
        totalSteps={TOTAL_STEPS}
        completedSteps={completedSteps}
        onExit={onExit}
        onSelectStudio={setStep}
      />
    );
  }

  if (step === 6) {
    return (
      <SessionCompleteScreen
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
        <FreeScribblingGame
          currentStep={1}
          totalSteps={TOTAL_STEPS}
          onBack={goBack}
          onComplete={() => markComplete(1)}
        />
      )}
      {step === 2 && (
        <ColorScribbleFillGame
          currentStep={2}
          totalSteps={TOTAL_STEPS}
          onBack={goBack}
          onComplete={() => markComplete(2)}
        />
      )}
      {step === 3 && (
        <TapToDrawGame
          currentStep={3}
          totalSteps={TOTAL_STEPS}
          onBack={goBack}
          onComplete={() => markComplete(3)}
        />
      )}
      {step === 4 && (
        <FollowLoosePathGame
          currentStep={4}
          totalSteps={TOTAL_STEPS}
          onBack={goBack}
          onComplete={() => markComplete(4)}
        />
      )}
      {step === 5 && (
        <ScribbleUploadTask
          currentStep={5}
          totalSteps={TOTAL_STEPS}
          onBack={goBack}
          onComplete={handleTaskComplete}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});
