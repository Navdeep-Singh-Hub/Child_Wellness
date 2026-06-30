/**
 * Level 7 Reader — Session 9: Logical Reasoning, Memory 14, Word TABLE, Pattern Game
 */
import { READER_SESSIONS } from '@/components/reader-session/shared/readerSessionConfigs';
import { ReaderSessionFlow } from '@/components/reader-session/shared/ReaderSessionFlow';
import React from 'react';
import { LogicalReasoningReaderSession9Game } from './LogicalReasoningReaderSession9Game';
import { MemoryAdvanced14ReaderSession9Game } from './MemoryAdvanced14ReaderSession9Game';
import { WordBuilderTableReaderSession9Game } from './WordBuilderTableReaderSession9Game';
import { PatternGameReaderSession9Game } from './PatternGameReaderSession9Game';
import { ReaderNotebookUploadDifferentColors } from './ReaderNotebookUploadDifferentColors';

interface ReaderSession9Props {
  onExit?: () => void;
}

export function ReaderSession9({ onExit }: ReaderSession9Props = {}) {
  const config = READER_SESSIONS[9];

  return (
    <ReaderSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, taskComplete) => (
        <>
          {step === 1 && <LogicalReasoningReaderSession9Game onComplete={advance} />}
          {step === 2 && <MemoryAdvanced14ReaderSession9Game onComplete={advance} />}
          {step === 3 && <WordBuilderTableReaderSession9Game onComplete={advance} />}
          {step === 4 && <PatternGameReaderSession9Game onComplete={advance} />}
          {step === 5 && <ReaderNotebookUploadDifferentColors onComplete={taskComplete} />}
        </>
      )}
    />
  );
}
