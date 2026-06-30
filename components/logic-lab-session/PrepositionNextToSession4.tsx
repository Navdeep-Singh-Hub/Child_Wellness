/**
 * Level 6 – The Logic Lab, Session 4: Preposition NEXT TO
 */
import React from 'react';
import { DragNextTo } from './DragNextTo';
import { PatternRecognitionNextTo } from './PatternRecognitionNextTo';
import { PositionChoiceNextTo } from './PositionChoiceNextTo';
import { PrepositionNextToNotebookUpload } from './PrepositionNextToNotebookUpload';
import { SequencePuzzleNextTo } from './SequencePuzzleNextTo';
import { LogicLabSessionFlow } from './shared/LogicLabSessionFlow';
import { LOGIC_LAB_SESSIONS } from './shared/logicLabSessionConfigs';

interface PrepositionNextToSession4Props {
  onExit?: () => void;
}

export function PrepositionNextToSession4({ onExit }: PrepositionNextToSession4Props = {}) {
  return (
    <LogicLabSessionFlow
      config={LOGIC_LAB_SESSIONS[4]}
      onExit={onExit}
      renderGame={(step, advance, notebookComplete) => {
        switch (step) {
          case 1:
            return <PositionChoiceNextTo onComplete={advance} />;
          case 2:
            return <DragNextTo onComplete={advance} />;
          case 3:
            return <PatternRecognitionNextTo onComplete={advance} />;
          case 4:
            return <SequencePuzzleNextTo onComplete={advance} />;
          case 5:
            return <PrepositionNextToNotebookUpload onComplete={notebookComplete} />;
          default:
            return null;
        }
      }}
    />
  );
}
