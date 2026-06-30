/**
 * Level 9 (Clockwise) — Session 9: Logic, Memory 18, HOSPITAL, Pattern & Same Size
 */
import { CLOCKWISE_SESSIONS } from '@/components/level9-session/shared/clockwiseSessionConfigs';
import { ClockwiseSessionFlow } from '@/components/level9-session/shared/ClockwiseSessionFlow';
import React from 'react';
import { LogicalReasoningLevel9Session9Game } from './LogicalReasoningLevel9Session9Game';
import { MemoryGrid18Level9Session9Game } from './MemoryGrid18Level9Session9Game';
import { WordBuilderHospitalLevel9Session9Game } from './WordBuilderHospitalLevel9Session9Game';
import { PatternLogicSquareTriangleCircleLevel9Session9Game } from './PatternLogicSquareTriangleCircleLevel9Session9Game';
import { Level9NotebookUploadSameSize } from './Level9NotebookUploadSameSize';

interface Level9Session9Props {
  onExit?: () => void;
}

export function Level9Session9({ onExit }: Level9Session9Props = {}) {
  const config = CLOCKWISE_SESSIONS[9];

  return (
    <ClockwiseSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, taskComplete) => (
        <>
          {step === 1 && <LogicalReasoningLevel9Session9Game onComplete={advance} />}
          {step === 2 && <MemoryGrid18Level9Session9Game onComplete={advance} />}
          {step === 3 && <WordBuilderHospitalLevel9Session9Game onComplete={advance} />}
          {step === 4 && <PatternLogicSquareTriangleCircleLevel9Session9Game onComplete={advance} />}
          {step === 5 && <Level9NotebookUploadSameSize onComplete={taskComplete} />}
        </>
      )}
    />
  );
}
