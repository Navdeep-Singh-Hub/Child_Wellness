/**
 * Level 1 – Session 10 (FINAL): Master Capital Letter Writing — Crown Hall
 */
import React, { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { FullAZWritingGame } from './FullAZWritingGame';
import { MemoryChallengeGame } from './MemoryChallengeGame';
import { MixedChallengeGame } from './MixedChallengeGame';
import { FunWritingGame } from './FunWritingGame';
import { MasterWritingUploadTask } from './MasterWritingUploadTask';
import { Session10IntroScreen } from './session-hub-s10/Session10IntroScreen';
import { Session10CompleteScreen } from './session-hub-s10/Session10CompleteScreen';
import { Level1CompleteCelebration } from './session-hub-s10/Level1CompleteCelebration';

const TOTAL_STEPS = 5;

interface Props {
  onExit?: () => void;
}

export function MasterSession10({ onExit }: Props = {}) {
  const [step, setStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [taskSuccess, setTaskSuccess] = useState<boolean | null>(null);
  const [showFinalCelebration, setShowFinalCelebration] = useState(false);

  const markComplete = useCallback((gameStep: number) => {
    setCompletedSteps((prev) => new Set([...prev, gameStep]));
    setStep(gameStep < TOTAL_STEPS ? gameStep + 1 : 6);
  }, []);

  const handleTaskComplete = useCallback((success: boolean) => {
    setTaskSuccess(success);
    if (success) {
      setCompletedSteps((prev) => new Set([...prev, 5]));
      setShowFinalCelebration(true);
    }
  }, []);

  if (showFinalCelebration) {
    return (
      <Level1CompleteCelebration
        onDone={() => {
          setShowFinalCelebration(false);
          setStep(6);
        }}
      />
    );
  }

  if (step === 0) {
    return (
      <Session10IntroScreen
        totalSteps={TOTAL_STEPS}
        completedSteps={completedSteps}
        onExit={onExit}
        onSelectStudio={setStep}
      />
    );
  }

  if (step === 6) {
    return (
      <Session10CompleteScreen
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
        <FullAZWritingGame currentStep={1} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={() => markComplete(1)} />
      )}
      {step === 2 && (
        <MemoryChallengeGame currentStep={2} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={() => markComplete(2)} />
      )}
      {step === 3 && (
        <MixedChallengeGame currentStep={3} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={() => markComplete(3)} />
      )}
      {step === 4 && (
        <FunWritingGame currentStep={4} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={() => markComplete(4)} />
      )}
      {step === 5 && (
        <MasterWritingUploadTask currentStep={5} totalSteps={TOTAL_STEPS} onBack={goBack} onComplete={handleTaskComplete} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});
