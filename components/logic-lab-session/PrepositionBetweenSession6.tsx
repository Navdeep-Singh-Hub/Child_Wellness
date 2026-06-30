/**
 * Level 6 – The Logic Lab, Session 6: Preposition BETWEEN
 */
import React from 'react';
import { DragBetweenObjects } from './DragBetweenObjects';
import { PatternRecognitionBetween } from './PatternRecognitionBetween';
import { PositionChoiceBetween } from './PositionChoiceBetween';
import { PrepositionBetweenNotebookUpload } from './PrepositionBetweenNotebookUpload';
import { SequencePuzzleBetween } from './SequencePuzzleBetween';
import { LogicLabSessionFlow } from './shared/LogicLabSessionFlow';
import { LOGIC_LAB_SESSIONS } from './shared/logicLabSessionConfigs';

interface PrepositionBetweenSession6Props {
  onExit?: () => void;
}

export function PrepositionBetweenSession6({ onExit }: PrepositionBetweenSession6Props = {}) {
  return (
    <LogicLabSessionFlow
      config={LOGIC_LAB_SESSIONS[6]}
      onExit={onExit}
      renderGame={(step, advance, notebookComplete) => {
        switch (step) {
          case 1:
            return <PositionChoiceBetween onComplete={advance} />;
          case 2:
            return <DragBetweenObjects onComplete={advance} />;
          case 3:
            return <PatternRecognitionBetween onComplete={advance} />;
          case 4:
            return <SequencePuzzleBetween onComplete={advance} />;
          case 5:
            return <PrepositionBetweenNotebookUpload onComplete={notebookComplete} />;
          default:
            return null;
        }
      }}
    />
  );
}
