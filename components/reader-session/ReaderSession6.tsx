/**
 * Level 7 Reader — Session 6: Visual Puzzle, Category Recognition, Pattern Logic, Counting 15
 */
import { READER_SESSIONS } from '@/components/reader-session/shared/readerSessionConfigs';
import { ReaderSessionFlow } from '@/components/reader-session/shared/ReaderSessionFlow';
import React from 'react';
import { VisualPuzzleReaderSession6Game } from './VisualPuzzleReaderSession6Game';
import { CategoryRecognitionReaderSession6Game } from './CategoryRecognitionReaderSession6Game';
import { PatternLogicCircleSquareReaderSession6Game } from './PatternLogicCircleSquareReaderSession6Game';
import { CountingChallenge15ReaderSession6Game } from './CountingChallenge15ReaderSession6Game';
import { ReaderNotebookUploadTwoFarOneMiddle } from './ReaderNotebookUploadTwoFarOneMiddle';

interface ReaderSession6Props {
  onExit?: () => void;
}

export function ReaderSession6({ onExit }: ReaderSession6Props = {}) {
  const config = READER_SESSIONS[6];

  return (
    <ReaderSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, taskComplete) => (
        <>
          {step === 1 && <VisualPuzzleReaderSession6Game onComplete={advance} />}
          {step === 2 && <CategoryRecognitionReaderSession6Game onComplete={advance} />}
          {step === 3 && <PatternLogicCircleSquareReaderSession6Game onComplete={advance} />}
          {step === 4 && <CountingChallenge15ReaderSession6Game onComplete={advance} />}
          {step === 5 && <ReaderNotebookUploadTwoFarOneMiddle onComplete={taskComplete} />}
        </>
      )}
    />
  );
}
