/**
 * Level 7 Reader — Session 10 (final): Mixed Quiz, Advanced Memory 16, Word SCHOOL, Logic Pattern
 */
import { READER_SESSIONS } from '@/components/reader-session/shared/readerSessionConfigs';
import { ReaderSessionFlow } from '@/components/reader-session/shared/ReaderSessionFlow';
import React from 'react';
import { MixedQuizReaderSession10Game } from './MixedQuizReaderSession10Game';
import { MemoryAdvanced16ReaderSession10Game } from './MemoryAdvanced16ReaderSession10Game';
import { WordBuilderSchoolReaderSession10Game } from './WordBuilderSchoolReaderSession10Game';
import { LogicPatternReaderSession10Game } from './LogicPatternReaderSession10Game';
import { ReaderNotebookUploadTowerFour } from './ReaderNotebookUploadTowerFour';

interface ReaderSession10Props {
  onExit?: () => void;
}

export function ReaderSession10({ onExit }: ReaderSession10Props = {}) {
  const config = READER_SESSIONS[10];

  return (
    <ReaderSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, taskComplete) => (
        <>
          {step === 1 && <MixedQuizReaderSession10Game onComplete={advance} />}
          {step === 2 && <MemoryAdvanced16ReaderSession10Game onComplete={advance} />}
          {step === 3 && <WordBuilderSchoolReaderSession10Game onComplete={advance} />}
          {step === 4 && <LogicPatternReaderSession10Game onComplete={advance} />}
          {step === 5 && <ReaderNotebookUploadTowerFour onComplete={taskComplete} />}
        </>
      )}
    />
  );
}
