/**
 * Level 6 – The Logic Lab, Session 9: Sequence Master
 */
import React from 'react';
import { DragPositionSequenceMaster } from './DragPositionSequenceMaster';
import { PatternRecognitionSequenceMaster } from './PatternRecognitionSequenceMaster';
import { PrepositionChoiceSequenceMaster } from './PrepositionChoiceSequenceMaster';
import { SequenceMasterNotebookUpload } from './SequenceMasterNotebookUpload';
import { SequencePuzzleSequenceMaster } from './SequencePuzzleSequenceMaster';
import { LogicLabSessionFlow } from './shared/LogicLabSessionFlow';
import { LOGIC_LAB_SESSIONS } from './shared/logicLabSessionConfigs';

interface SequenceMasterSession9Props {
  onExit?: () => void;
}

export function SequenceMasterSession9({ onExit }: SequenceMasterSession9Props = {}) {
  return (
    <LogicLabSessionFlow
      config={LOGIC_LAB_SESSIONS[9]}
      onExit={onExit}
      renderGame={(step, advance, notebookComplete) => {
        switch (step) {
          case 1:
            return <PrepositionChoiceSequenceMaster onComplete={advance} />;
          case 2:
            return <DragPositionSequenceMaster onComplete={advance} />;
          case 3:
            return <PatternRecognitionSequenceMaster onComplete={advance} />;
          case 4:
            return <SequencePuzzleSequenceMaster onComplete={advance} />;
          case 5:
            return <SequenceMasterNotebookUpload onComplete={notebookComplete} />;
          default:
            return null;
        }
      }}
    />
  );
}
