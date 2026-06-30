/**
 * Level 7 Reader — Session 8: Spot the Pattern, Number Pattern, Shape Puzzle, Robot Assembly
 */
import { READER_SESSIONS } from '@/components/reader-session/shared/readerSessionConfigs';
import { ReaderSessionFlow } from '@/components/reader-session/shared/ReaderSessionFlow';
import React from 'react';
import { SpotThePatternRedBlueReaderSession8Game } from './SpotThePatternRedBlueReaderSession8Game';
import { NumberPatternReaderSession8Game } from './NumberPatternReaderSession8Game';
import { ShapePuzzleComplexReaderSession8Game } from './ShapePuzzleComplexReaderSession8Game';
import { RobotAssemblyReaderSession8Game } from './RobotAssemblyReaderSession8Game';
import { ReaderNotebookUploadTriangleLayout } from './ReaderNotebookUploadTriangleLayout';

interface ReaderSession8Props {
  onExit?: () => void;
}

export function ReaderSession8({ onExit }: ReaderSession8Props = {}) {
  const config = READER_SESSIONS[8];

  return (
    <ReaderSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, taskComplete) => (
        <>
          {step === 1 && <SpotThePatternRedBlueReaderSession8Game onComplete={advance} />}
          {step === 2 && <NumberPatternReaderSession8Game onComplete={advance} />}
          {step === 3 && <ShapePuzzleComplexReaderSession8Game onComplete={advance} />}
          {step === 4 && <RobotAssemblyReaderSession8Game onComplete={advance} />}
          {step === 5 && <ReaderNotebookUploadTriangleLayout onComplete={taskComplete} />}
        </>
      )}
    />
  );
}
