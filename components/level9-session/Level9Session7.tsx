/**
 * Level 9 (Clockwise) — Session 7: Emotion, Memory 16, COMPUTER, Tool Matching
 */
import { CLOCKWISE_SESSIONS } from '@/components/level9-session/shared/clockwiseSessionConfigs';
import { ClockwiseSessionFlow } from '@/components/level9-session/shared/ClockwiseSessionFlow';
import React from 'react';
import { EmotionRecognitionConfusedLevel9Session7Game } from './EmotionRecognitionConfusedLevel9Session7Game';
import { MemoryAdvanced16Level9Session7Game } from './MemoryAdvanced16Level9Session7Game';
import { WordBuilderComputerLevel9Session7Game } from './WordBuilderComputerLevel9Session7Game';
import { ObjectMatchingToolsLevel9Session7Game } from './ObjectMatchingToolsLevel9Session7Game';
import { Level9NotebookUploadDifferentShapes } from './Level9NotebookUploadDifferentShapes';

interface Level9Session7Props {
  onExit?: () => void;
}

export function Level9Session7({ onExit }: Level9Session7Props = {}) {
  const config = CLOCKWISE_SESSIONS[7];

  return (
    <ClockwiseSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, taskComplete) => (
        <>
          {step === 1 && <EmotionRecognitionConfusedLevel9Session7Game onComplete={advance} />}
          {step === 2 && <MemoryAdvanced16Level9Session7Game onComplete={advance} />}
          {step === 3 && <WordBuilderComputerLevel9Session7Game onComplete={advance} />}
          {step === 4 && <ObjectMatchingToolsLevel9Session7Game onComplete={advance} />}
          {step === 5 && <Level9NotebookUploadDifferentShapes onComplete={taskComplete} />}
        </>
      )}
    />
  );
}
