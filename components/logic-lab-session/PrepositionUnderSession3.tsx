/**
 * Level 6 – The Logic Lab, Session 3: Preposition UNDER
 */
import React from 'react';
import { DragUnderObject } from './DragUnderObject';
import { PatternRecognitionUnder } from './PatternRecognitionUnder';
import { PositionChoiceUnder } from './PositionChoiceUnder';
import { PrepositionUnderNotebookUpload } from './PrepositionUnderNotebookUpload';
import { SequencePuzzleUnder } from './SequencePuzzleUnder';
import { LogicLabSessionFlow } from './shared/LogicLabSessionFlow';
import { LOGIC_LAB_SESSIONS } from './shared/logicLabSessionConfigs';

interface PrepositionUnderSession3Props {
  onExit?: () => void;
}

export function PrepositionUnderSession3({ onExit }: PrepositionUnderSession3Props = {}) {
  return (
    <LogicLabSessionFlow
      config={LOGIC_LAB_SESSIONS[3]}
      onExit={onExit}
      renderGame={(step, advance, notebookComplete) => {
        switch (step) {
          case 1:
            return <PositionChoiceUnder onComplete={advance} />;
          case 2:
            return <DragUnderObject onComplete={advance} />;
          case 3:
            return <PatternRecognitionUnder onComplete={advance} />;
          case 4:
            return <SequencePuzzleUnder onComplete={advance} />;
          case 5:
            return <PrepositionUnderNotebookUpload onComplete={notebookComplete} />;
          default:
            return null;
        }
      }}
    />
  );
}
