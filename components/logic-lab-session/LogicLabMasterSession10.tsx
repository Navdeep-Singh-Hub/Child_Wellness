/**
 * Level 6 – The Logic Lab, Session 10: Logic Lab Master (final challenge)
 */
import React from 'react';
import { LogicLabMasterNotebookUpload } from './LogicLabMasterNotebookUpload';
import { PatternChallengeLogicLabMaster } from './PatternChallengeLogicLabMaster';
import { PositionHuntLogicLabMaster } from './PositionHuntLogicLabMaster';
import { PrepositionQuizLogicLabMaster } from './PrepositionQuizLogicLabMaster';
import { SequencePuzzleLogicLabMaster } from './SequencePuzzleLogicLabMaster';
import { LogicLabSessionFlow } from './shared/LogicLabSessionFlow';
import { LOGIC_LAB_SESSIONS } from './shared/logicLabSessionConfigs';

interface LogicLabMasterSession10Props {
  onExit?: () => void;
}

export function LogicLabMasterSession10({ onExit }: LogicLabMasterSession10Props = {}) {
  return (
    <LogicLabSessionFlow
      config={LOGIC_LAB_SESSIONS[10]}
      onExit={onExit}
      renderGame={(step, advance, notebookComplete) => {
        switch (step) {
          case 1:
            return <PositionHuntLogicLabMaster onComplete={advance} />;
          case 2:
            return <PrepositionQuizLogicLabMaster onComplete={advance} />;
          case 3:
            return <PatternChallengeLogicLabMaster onComplete={advance} />;
          case 4:
            return <SequencePuzzleLogicLabMaster onComplete={advance} />;
          case 5:
            return <LogicLabMasterNotebookUpload onComplete={notebookComplete} />;
          default:
            return null;
        }
      }}
    />
  );
}
