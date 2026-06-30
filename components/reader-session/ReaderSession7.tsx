/**
 * Level 7 Reader — Session 7: Emotion Recognition, Memory 12, Word CHAIR, Object Matching
 */
import { READER_SESSIONS } from '@/components/reader-session/shared/readerSessionConfigs';
import { ReaderSessionFlow } from '@/components/reader-session/shared/ReaderSessionFlow';
import React from 'react';
import { EmotionRecognitionSurprisedReaderSession7Game } from './EmotionRecognitionSurprisedReaderSession7Game';
import { MemoryGrid12ReaderSession7Game } from './MemoryGrid12ReaderSession7Game';
import { WordBuilderChairReaderSession7Game } from './WordBuilderChairReaderSession7Game';
import { ObjectMatchingToolReaderSession7Game } from './ObjectMatchingToolReaderSession7Game';
import { ReaderNotebookUploadThreeDifferentSizes } from './ReaderNotebookUploadThreeDifferentSizes';

interface ReaderSession7Props {
  onExit?: () => void;
}

export function ReaderSession7({ onExit }: ReaderSession7Props = {}) {
  const config = READER_SESSIONS[7];

  return (
    <ReaderSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, taskComplete) => (
        <>
          {step === 1 && <EmotionRecognitionSurprisedReaderSession7Game onComplete={advance} />}
          {step === 2 && <MemoryGrid12ReaderSession7Game onComplete={advance} />}
          {step === 3 && <WordBuilderChairReaderSession7Game onComplete={advance} />}
          {step === 4 && <ObjectMatchingToolReaderSession7Game onComplete={advance} />}
          {step === 5 && <ReaderNotebookUploadThreeDifferentSizes onComplete={taskComplete} />}
        </>
      )}
    />
  );
}
