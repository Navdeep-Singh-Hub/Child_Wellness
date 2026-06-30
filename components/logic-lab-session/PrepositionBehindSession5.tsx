/**
 * Level 6 – The Logic Lab, Session 5: Preposition BEHIND
 */
import React from 'react';
import { DragBehindObject } from './DragBehindObject';
import { PatternRecognitionBehind } from './PatternRecognitionBehind';
import { PositionChoiceBehind } from './PositionChoiceBehind';
import { PrepositionBehindNotebookUpload } from './PrepositionBehindNotebookUpload';
import { SequencePuzzleBehind } from './SequencePuzzleBehind';
import { LogicLabSessionFlow } from './shared/LogicLabSessionFlow';
import { LOGIC_LAB_SESSIONS } from './shared/logicLabSessionConfigs';

interface PrepositionBehindSession5Props {
  onExit?: () => void;
}

export function PrepositionBehindSession5({ onExit }: PrepositionBehindSession5Props = {}) {
  return (
    <LogicLabSessionFlow
      config={LOGIC_LAB_SESSIONS[5]}
      onExit={onExit}
      renderGame={(step, advance, notebookComplete) => {
        switch (step) {
          case 1:
            return <PositionChoiceBehind onComplete={advance} />;
          case 2:
            return <DragBehindObject onComplete={advance} />;
          case 3:
            return <PatternRecognitionBehind onComplete={advance} />;
          case 4:
            return <SequencePuzzleBehind onComplete={advance} />;
          case 5:
            return <PrepositionBehindNotebookUpload onComplete={notebookComplete} />;
          default:
            return null;
        }
      }}
    />
  );
}
