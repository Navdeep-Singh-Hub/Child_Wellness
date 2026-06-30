/**
 * Level 7 Reader — Session 1: Pattern Logic, Memory Grid, Word Builder TREE, Category Sorting
 */
import { READER_SESSIONS } from '@/components/reader-session/shared/readerSessionConfigs';
import { ReaderSessionFlow } from '@/components/reader-session/shared/ReaderSessionFlow';
import React from 'react';
import { PatternLogicReaderSession1Game } from './PatternLogicReaderSession1Game';
import { MemoryGrid8ReaderSession1Game } from './MemoryGrid8ReaderSession1Game';
import { WordBuilderTreeReaderSession1Game } from './WordBuilderTreeReaderSession1Game';
import { CategorySortingReaderSession1Game } from './CategorySortingReaderSession1Game';
import { ReaderNotebookUploadThreeDifferentLine } from './ReaderNotebookUploadThreeDifferentLine';

interface ReaderSession1Props {
  onExit?: () => void;
}

export function ReaderSession1({ onExit }: ReaderSession1Props = {}) {
  const config = READER_SESSIONS[1];

  return (
    <ReaderSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, taskComplete) => (
        <>
          {step === 1 && <PatternLogicReaderSession1Game onComplete={advance} />}
          {step === 2 && <MemoryGrid8ReaderSession1Game onComplete={advance} />}
          {step === 3 && <WordBuilderTreeReaderSession1Game onComplete={advance} />}
          {step === 4 && <CategorySortingReaderSession1Game onComplete={advance} />}
          {step === 5 && <ReaderNotebookUploadThreeDifferentLine onComplete={taskComplete} />}
        </>
      )}
    />
  );
}
