/**
 * Level 9 (Clockwise) — Session 5: Color Memory, Number Ladder, HOUSE, Bridge, Stack 3
 */
import { CLOCKWISE_SESSIONS } from '@/components/level9-session/shared/clockwiseSessionConfigs';
import { ClockwiseSessionFlow } from '@/components/level9-session/shared/ClockwiseSessionFlow';
import React from 'react';
import { MemoryPatternLevel9Session5Game } from './MemoryPatternLevel9Session5Game';
import { NumberLogicLevel9Session5Game } from './NumberLogicLevel9Session5Game';
import { WordBuilderHouseLevel9Session5Game } from './WordBuilderHouseLevel9Session5Game';
import { BridgeConstructionLevel9Session5Game } from './BridgeConstructionLevel9Session5Game';
import { Level9NotebookUploadStackThreeVertical } from './Level9NotebookUploadStackThreeVertical';

interface Level9Session5Props {
  onExit?: () => void;
}

export function Level9Session5({ onExit }: Level9Session5Props = {}) {
  const config = CLOCKWISE_SESSIONS[5];

  return (
    <ClockwiseSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, taskComplete) => (
        <>
          {step === 1 && <MemoryPatternLevel9Session5Game onComplete={advance} />}
          {step === 2 && <NumberLogicLevel9Session5Game onComplete={advance} />}
          {step === 3 && <WordBuilderHouseLevel9Session5Game onComplete={advance} />}
          {step === 4 && <BridgeConstructionLevel9Session5Game onComplete={advance} />}
          {step === 5 && <Level9NotebookUploadStackThreeVertical onComplete={taskComplete} />}
        </>
      )}
    />
  );
}
