/**
 * Level 9 (Clockwise) — Session 1: Advanced Pattern, Memory 12, Word BRIDGE, Category Logic
 */
import { CLOCKWISE_SESSIONS } from '@/components/level9-session/shared/clockwiseSessionConfigs';
import { ClockwiseSessionFlow } from '@/components/level9-session/shared/ClockwiseSessionFlow';
import React from 'react';
import { AdvancedPatternLevel9Session1Game } from './AdvancedPatternLevel9Session1Game';
import { MemoryChallenge12Level9Session1Game } from './MemoryChallenge12Level9Session1Game';
import { WordBuilderBridgeLevel9Session1Game } from './WordBuilderBridgeLevel9Session1Game';
import { CategoryLogicLivingNonLivingLevel9Session1Game } from './CategoryLogicLivingNonLivingLevel9Session1Game';
import { Level9NotebookUploadFourLineEqual } from './Level9NotebookUploadFourLineEqual';

interface Level9Session1Props {
  onExit?: () => void;
}

export function Level9Session1({ onExit }: Level9Session1Props = {}) {
  const config = CLOCKWISE_SESSIONS[1];

  return (
    <ClockwiseSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, taskComplete) => (
        <>
          {step === 1 && <AdvancedPatternLevel9Session1Game onComplete={advance} />}
          {step === 2 && <MemoryChallenge12Level9Session1Game onComplete={advance} />}
          {step === 3 && <WordBuilderBridgeLevel9Session1Game onComplete={advance} />}
          {step === 4 && <CategoryLogicLivingNonLivingLevel9Session1Game onComplete={advance} />}
          {step === 5 && <Level9NotebookUploadFourLineEqual onComplete={taskComplete} />}
        </>
      )}
    />
  );
}
