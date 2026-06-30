/**
 * Level 7 Reader — Session 5: Memory Pattern, Number Logic, Word HOUSE, Bridge Construction
 */
import { READER_SESSIONS } from '@/components/reader-session/shared/readerSessionConfigs';
import { ReaderSessionFlow } from '@/components/reader-session/shared/ReaderSessionFlow';
import React from 'react';
import { MemoryPatternReaderSession5Game } from './MemoryPatternReaderSession5Game';
import { NumberLogicReaderSession5Game } from './NumberLogicReaderSession5Game';
import { WordBuilderHouseReaderSession5Game } from './WordBuilderHouseReaderSession5Game';
import { BridgeConstructionReaderSession5Game } from './BridgeConstructionReaderSession5Game';
import { ReaderNotebookUploadStackThreeVertical } from './ReaderNotebookUploadStackThreeVertical';

interface ReaderSession5Props {
  onExit?: () => void;
}

export function ReaderSession5({ onExit }: ReaderSession5Props = {}) {
  const config = READER_SESSIONS[5];

  return (
    <ReaderSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, taskComplete) => (
        <>
          {step === 1 && <MemoryPatternReaderSession5Game onComplete={advance} />}
          {step === 2 && <NumberLogicReaderSession5Game onComplete={advance} />}
          {step === 3 && <WordBuilderHouseReaderSession5Game onComplete={advance} />}
          {step === 4 && <BridgeConstructionReaderSession5Game onComplete={advance} />}
          {step === 5 && <ReaderNotebookUploadStackThreeVertical onComplete={taskComplete} />}
        </>
      )}
    />
  );
}
