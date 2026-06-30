/**
 * Level 9 (Clockwise) — Session 3: Logical Selection, Memory 14, Word ORANGE, Pattern Builder
 */
import { CLOCKWISE_SESSIONS } from '@/components/level9-session/shared/clockwiseSessionConfigs';
import { ClockwiseSessionFlow } from '@/components/level9-session/shared/ClockwiseSessionFlow';
import React from 'react';
import { LogicalSelectionLevel9Session3Game } from './LogicalSelectionLevel9Session3Game';
import { MemoryGrid14Level9Session3Game } from './MemoryGrid14Level9Session3Game';
import { WordBuilderOrangeLevel9Session3Game } from './WordBuilderOrangeLevel9Session3Game';
import { PatternBuilderLevel9Session3Game } from './PatternBuilderLevel9Session3Game';
import { Level9NotebookUploadSquareLayout } from './Level9NotebookUploadSquareLayout';

interface Level9Session3Props {
  onExit?: () => void;
}

export function Level9Session3({ onExit }: Level9Session3Props = {}) {
  const config = CLOCKWISE_SESSIONS[3];

  return (
    <ClockwiseSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, taskComplete) => (
        <>
          {step === 1 && <LogicalSelectionLevel9Session3Game onComplete={advance} />}
          {step === 2 && <MemoryGrid14Level9Session3Game onComplete={advance} />}
          {step === 3 && <WordBuilderOrangeLevel9Session3Game onComplete={advance} />}
          {step === 4 && <PatternBuilderLevel9Session3Game onComplete={advance} />}
          {step === 5 && <Level9NotebookUploadSquareLayout onComplete={taskComplete} />}
        </>
      )}
    />
  );
}
