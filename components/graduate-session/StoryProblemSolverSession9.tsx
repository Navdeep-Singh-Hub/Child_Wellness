/**
 * Level 10 – The Graduate, Session 9: Story Problem Solver
 */
import { GRADUATE_SESSIONS } from '@/components/graduate-session/shared/graduateSessionConfigs';
import { GraduateSessionFlow } from '@/components/graduate-session/shared/GraduateSessionFlow';
import React from 'react';
import { StoryReadingRiyaBall } from './StoryReadingRiyaBall';
import { DialogueCompleteCanYouHelp } from './DialogueCompleteCanYouHelp';
import { WordProblemCandiesLeft } from './WordProblemCandiesLeft';
import { LogicPuzzleAppleBanana } from './LogicPuzzleAppleBanana';
import { StoryProblemSolverNotebookUpload } from './StoryProblemSolverNotebookUpload';

interface StoryProblemSolverSession9Props {
  onExit?: () => void;
}

export function StoryProblemSolverSession9({ onExit }: StoryProblemSolverSession9Props = {}) {
  const config = GRADUATE_SESSIONS[9];

  return (
    <GraduateSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, notebookComplete) => (
        <>
          {step === 1 && <StoryReadingRiyaBall onComplete={advance} />}
          {step === 2 && <DialogueCompleteCanYouHelp onComplete={advance} />}
          {step === 3 && <WordProblemCandiesLeft onComplete={advance} />}
          {step === 4 && <LogicPuzzleAppleBanana onComplete={advance} />}
          {step === 5 && <StoryProblemSolverNotebookUpload onComplete={notebookComplete} />}
        </>
      )}
    />
  );
}
