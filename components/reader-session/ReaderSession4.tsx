/**
 * Level 7 Reader — Session 4: Counting 12, Shape Rotation, Object Function, Indoor/Outdoor Sort
 */
import { READER_SESSIONS } from '@/components/reader-session/shared/readerSessionConfigs';
import { ReaderSessionFlow } from '@/components/reader-session/shared/ReaderSessionFlow';
import React from 'react';
import { CountingChallenge12ReaderSession4Game } from './CountingChallenge12ReaderSession4Game';
import { ShapeRotationRectangleReaderSession4Game } from './ShapeRotationRectangleReaderSession4Game';
import { ObjectFunctionReaderSession4Game } from './ObjectFunctionReaderSession4Game';
import { IndoorOutdoorSortingReaderSession4Game } from './IndoorOutdoorSortingReaderSession4Game';
import { ReaderNotebookUploadRoundSquare } from './ReaderNotebookUploadRoundSquare';

interface ReaderSession4Props {
  onExit?: () => void;
}

export function ReaderSession4({ onExit }: ReaderSession4Props = {}) {
  const config = READER_SESSIONS[4];

  return (
    <ReaderSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, taskComplete) => (
        <>
          {step === 1 && <CountingChallenge12ReaderSession4Game onComplete={advance} />}
          {step === 2 && <ShapeRotationRectangleReaderSession4Game onComplete={advance} />}
          {step === 3 && <ObjectFunctionReaderSession4Game onComplete={advance} />}
          {step === 4 && <IndoorOutdoorSortingReaderSession4Game onComplete={advance} />}
          {step === 5 && <ReaderNotebookUploadRoundSquare onComplete={taskComplete} />}
        </>
      )}
    />
  );
}
