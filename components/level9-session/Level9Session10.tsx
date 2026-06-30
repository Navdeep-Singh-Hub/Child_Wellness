/**
 * Level 9 (Clockwise) — Session 10 (Final): Mixed Challenge, Memory 20, EDUCATION, Logic Pattern
 */
import { CLOCKWISE_SESSIONS } from '@/components/level9-session/shared/clockwiseSessionConfigs';
import { ClockwiseSessionFlow } from '@/components/level9-session/shared/ClockwiseSessionFlow';
import React from 'react';
import { MixedChallengeLevel9Session10Game } from './MixedChallengeLevel9Session10Game';
import { MemoryAdvanced20Level9Session10Game } from './MemoryAdvanced20Level9Session10Game';
import { WordBuilderEducationLevel9Session10Game } from './WordBuilderEducationLevel9Session10Game';
import { LogicPatternTriangleSquareLevel9Session10Game } from './LogicPatternTriangleSquareLevel9Session10Game';
import { Level9NotebookUploadTowerFive } from './Level9NotebookUploadTowerFive';

interface Level9Session10Props {
  onExit?: () => void;
}

export function Level9Session10({ onExit }: Level9Session10Props = {}) {
  const config = CLOCKWISE_SESSIONS[10];

  return (
    <ClockwiseSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, taskComplete) => (
        <>
          {step === 1 && <MixedChallengeLevel9Session10Game onComplete={advance} />}
          {step === 2 && <MemoryAdvanced20Level9Session10Game onComplete={advance} />}
          {step === 3 && <WordBuilderEducationLevel9Session10Game onComplete={advance} />}
          {step === 4 && <LogicPatternTriangleSquareLevel9Session10Game onComplete={advance} />}
          {step === 5 && <Level9NotebookUploadTowerFive onComplete={taskComplete} />}
        </>
      )}
    />
  );
}
