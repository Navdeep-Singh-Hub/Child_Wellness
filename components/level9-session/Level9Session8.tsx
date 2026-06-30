/**
 * Level 9 (Clockwise) — Session 8: Pattern, 3/9/27, Shape Puzzle & Robot
 */
import { CLOCKWISE_SESSIONS } from '@/components/level9-session/shared/clockwiseSessionConfigs';
import { ClockwiseSessionFlow } from '@/components/level9-session/shared/ClockwiseSessionFlow';
import React from 'react';
import { PatternSequenceRedBlueGreenLevel9Session8Game } from './PatternSequenceRedBlueGreenLevel9Session8Game';
import { NumberPattern3_9_27Level9Session8Game } from './NumberPattern3_9_27Level9Session8Game';
import { ShapePuzzleBoardLevel9Session8Game } from './ShapePuzzleBoardLevel9Session8Game';
import { RobotAssemblyLevel9Session8Game } from './RobotAssemblyLevel9Session8Game';
import { Level9NotebookUploadFiveCircle } from './Level9NotebookUploadFiveCircle';

interface Level9Session8Props {
  onExit?: () => void;
}

export function Level9Session8({ onExit }: Level9Session8Props = {}) {
  const config = CLOCKWISE_SESSIONS[8];

  return (
    <ClockwiseSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, taskComplete) => (
        <>
          {step === 1 && <PatternSequenceRedBlueGreenLevel9Session8Game onComplete={advance} />}
          {step === 2 && <NumberPattern3_9_27Level9Session8Game onComplete={advance} />}
          {step === 3 && <ShapePuzzleBoardLevel9Session8Game onComplete={advance} />}
          {step === 4 && <RobotAssemblyLevel9Session8Game onComplete={advance} />}
          {step === 5 && <Level9NotebookUploadFiveCircle onComplete={taskComplete} />}
        </>
      )}
    />
  );
}
