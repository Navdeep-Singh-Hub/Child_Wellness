/**
 * Level 7 Reader — Session 3: Logical Selection, Memory 10, Word Builder APPLE, Pattern Builder
 */
import { READER_SESSIONS } from '@/components/reader-session/shared/readerSessionConfigs';
import { ReaderSessionFlow } from '@/components/reader-session/shared/ReaderSessionFlow';
import React from 'react';
import { LogicalSelectionReaderSession3Game } from './LogicalSelectionReaderSession3Game';
import { MemoryAdvanced10ReaderSession3Game } from './MemoryAdvanced10ReaderSession3Game';
import { WordBuilderAppleReaderSession3Game } from './WordBuilderAppleReaderSession3Game';
import { PatternBuilderReaderSession3Game } from './PatternBuilderReaderSession3Game';
import { ReaderNotebookUploadSquareLayout } from './ReaderNotebookUploadSquareLayout';

interface ReaderSession3Props {
  onExit?: () => void;
}

export function ReaderSession3({ onExit }: ReaderSession3Props = {}) {
  const config = READER_SESSIONS[3];

  return (
    <ReaderSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, taskComplete) => (
        <>
          {step === 1 && <LogicalSelectionReaderSession3Game onComplete={advance} />}
          {step === 2 && <MemoryAdvanced10ReaderSession3Game onComplete={advance} />}
          {step === 3 && <WordBuilderAppleReaderSession3Game onComplete={advance} />}
          {step === 4 && <PatternBuilderReaderSession3Game onComplete={advance} />}
          {step === 5 && <ReaderNotebookUploadSquareLayout onComplete={taskComplete} />}
        </>
      )}
    />
  );
}
