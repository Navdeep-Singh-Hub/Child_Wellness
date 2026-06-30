/**
 * Level 7 Reader — Session 2: Number Sequence, Spot the Difference, Shape (Pentagon), Bicycle Puzzle
 */
import { READER_SESSIONS } from '@/components/reader-session/shared/readerSessionConfigs';
import { ReaderSessionFlow } from '@/components/reader-session/shared/ReaderSessionFlow';
import React from 'react';
import { NumberSequenceReaderSession2Game } from './NumberSequenceReaderSession2Game';
import { SpotTheDifferenceReaderSession2Game } from './SpotTheDifferenceReaderSession2Game';
import { ShapeIdentificationPentagonReaderSession2Game } from './ShapeIdentificationPentagonReaderSession2Game';
import { BicyclePuzzleReaderSession2Game } from './BicyclePuzzleReaderSession2Game';
import { ReaderNotebookUploadSameColor } from './ReaderNotebookUploadSameColor';

interface ReaderSession2Props {
  onExit?: () => void;
}

export function ReaderSession2({ onExit }: ReaderSession2Props = {}) {
  const config = READER_SESSIONS[2];

  return (
    <ReaderSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, taskComplete) => (
        <>
          {step === 1 && <NumberSequenceReaderSession2Game onComplete={advance} />}
          {step === 2 && <SpotTheDifferenceReaderSession2Game onComplete={advance} />}
          {step === 3 && <ShapeIdentificationPentagonReaderSession2Game onComplete={advance} />}
          {step === 4 && <BicyclePuzzleReaderSession2Game onComplete={advance} />}
          {step === 5 && <ReaderNotebookUploadSameColor onComplete={taskComplete} />}
        </>
      )}
    />
  );
}
