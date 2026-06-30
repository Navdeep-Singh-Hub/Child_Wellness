/**
 * Level 6 – The Logic Lab, Session 8: Pattern Builder
 */
import React from 'react';
import { DragPositionPatternBuilder } from './DragPositionPatternBuilder';
import { PatternBuilderGame } from './PatternBuilderGame';
import { PatternBuilderNotebookUpload } from './PatternBuilderNotebookUpload';
import { PrepositionSentenceGame } from './PrepositionSentenceGame';
import { SequencePuzzlePatternBuilder } from './SequencePuzzlePatternBuilder';
import { LogicLabSessionFlow } from './shared/LogicLabSessionFlow';
import { LOGIC_LAB_SESSIONS } from './shared/logicLabSessionConfigs';

interface PatternBuilderSession8Props {
  onExit?: () => void;
}

export function PatternBuilderSession8({ onExit }: PatternBuilderSession8Props = {}) {
  return (
    <LogicLabSessionFlow
      config={LOGIC_LAB_SESSIONS[8]}
      onExit={onExit}
      renderGame={(step, advance, notebookComplete) => {
        switch (step) {
          case 1:
            return <PrepositionSentenceGame onComplete={advance} />;
          case 2:
            return <DragPositionPatternBuilder onComplete={advance} />;
          case 3:
            return <PatternBuilderGame onComplete={advance} />;
          case 4:
            return <SequencePuzzlePatternBuilder onComplete={advance} />;
          case 5:
            return <PatternBuilderNotebookUpload onComplete={notebookComplete} />;
          default:
            return null;
        }
      }}
    />
  );
}
