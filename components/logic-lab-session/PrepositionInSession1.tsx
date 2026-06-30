/**
 * Level 6 – The Logic Lab, Session 1: Preposition IN
 */
import React from 'react';
import { DragIntoContainer } from './DragIntoContainer';
import { PatternBuilder } from './PatternBuilder';
import { PositionChoice } from './PositionChoice';
import { PrepositionInNotebookUpload } from './PrepositionInNotebookUpload';
import { SequenceOrder } from './SequenceOrder';
import { LogicLabSessionFlow } from './shared/LogicLabSessionFlow';
import { LOGIC_LAB_SESSIONS } from './shared/logicLabSessionConfigs';

interface PrepositionInSession1Props {
  onExit?: () => void;
}

export function PrepositionInSession1({ onExit }: PrepositionInSession1Props = {}) {
  return (
    <LogicLabSessionFlow
      config={LOGIC_LAB_SESSIONS[1]}
      onExit={onExit}
      renderGame={(step, advance, notebookComplete) => {
        switch (step) {
          case 1:
            return <PositionChoice onComplete={advance} />;
          case 2:
            return <DragIntoContainer onComplete={advance} />;
          case 3:
            return <PatternBuilder onComplete={advance} />;
          case 4:
            return <SequenceOrder onComplete={advance} />;
          case 5:
            return <PrepositionInNotebookUpload onComplete={notebookComplete} />;
          default:
            return null;
        }
      }}
    />
  );
}
