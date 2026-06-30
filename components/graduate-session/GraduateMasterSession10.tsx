/**
 * Level 10 – The Graduate, Session 10: Graduate Master Challenge (finale)
 */
import { GRADUATE_SESSIONS } from '@/components/graduate-session/shared/graduateSessionConfigs';
import { GraduateSessionFlow } from '@/components/graduate-session/shared/GraduateSessionFlow';
import React from 'react';
import { StoryBuilderPark } from './StoryBuilderPark';
import { DialogueQuizMaster } from './DialogueQuizMaster';
import { WordProblemRiyaApples } from './WordProblemRiyaApples';
import { LogicMasterPuzzleTriangleCircle } from './LogicMasterPuzzleTriangleCircle';
import { GraduateMasterNotebookUpload } from './GraduateMasterNotebookUpload';

interface GraduateMasterSession10Props {
  onExit?: () => void;
}

export function GraduateMasterSession10({ onExit }: GraduateMasterSession10Props = {}) {
  const config = GRADUATE_SESSIONS[10];

  return (
    <GraduateSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, notebookComplete) => (
        <>
          {step === 1 && <StoryBuilderPark onComplete={advance} />}
          {step === 2 && <DialogueQuizMaster onComplete={advance} />}
          {step === 3 && <WordProblemRiyaApples onComplete={advance} />}
          {step === 4 && <LogicMasterPuzzleTriangleCircle onComplete={advance} />}
          {step === 5 && <GraduateMasterNotebookUpload onComplete={notebookComplete} />}
        </>
      )}
    />
  );
}
