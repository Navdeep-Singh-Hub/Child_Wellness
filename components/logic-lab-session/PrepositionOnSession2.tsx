/**
 * Level 6 – The Logic Lab, Session 2: Preposition ON
 */
import React from 'react';
import { DragOnSurface } from './DragOnSurface';
import { PatternRecognitionOn } from './PatternRecognitionOn';
import { PositionChoiceOn } from './PositionChoiceOn';
import { PrepositionOnNotebookUpload } from './PrepositionOnNotebookUpload';
import { SequencePuzzleOn } from './SequencePuzzleOn';
import { LogicLabSessionFlow } from './shared/LogicLabSessionFlow';
import { LOGIC_LAB_SESSIONS } from './shared/logicLabSessionConfigs';

interface PrepositionOnSession2Props {
  onExit?: () => void;
}

export function PrepositionOnSession2({ onExit }: PrepositionOnSession2Props = {}) {
  return (
    <LogicLabSessionFlow
      config={LOGIC_LAB_SESSIONS[2]}
      onExit={onExit}
      renderGame={(step, advance, notebookComplete) => {
        switch (step) {
          case 1:
            return <PositionChoiceOn onComplete={advance} />;
          case 2:
            return <DragOnSurface onComplete={advance} />;
          case 3:
            return <PatternRecognitionOn onComplete={advance} />;
          case 4:
            return <SequencePuzzleOn onComplete={advance} />;
          case 5:
            return <PrepositionOnNotebookUpload onComplete={notebookComplete} />;
          default:
            return null;
        }
      }}
    />
  );
}
