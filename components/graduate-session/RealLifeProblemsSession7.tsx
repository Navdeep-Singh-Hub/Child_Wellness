/**
 * Level 10 – The Graduate, Session 7: Real Life Problems
 */
import { GRADUATE_SESSIONS } from '@/components/graduate-session/shared/graduateSessionConfigs';
import { GraduateSessionFlow } from '@/components/graduate-session/shared/GraduateSessionFlow';
import React from 'react';
import { StoryQuestionPencils } from './StoryQuestionPencils';
import { ConversationCompleteBorrowPencil } from './ConversationCompleteBorrowPencil';
import { WordProblemPencils } from './WordProblemPencils';
import { PatternPuzzleBlueGreen } from './PatternPuzzleBlueGreen';
import { RealLifeProblemsNotebookUpload } from './RealLifeProblemsNotebookUpload';

interface RealLifeProblemsSession7Props {
  onExit?: () => void;
}

export function RealLifeProblemsSession7({ onExit }: RealLifeProblemsSession7Props = {}) {
  const config = GRADUATE_SESSIONS[7];

  return (
    <GraduateSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, notebookComplete) => (
        <>
          {step === 1 && <StoryQuestionPencils onComplete={advance} />}
          {step === 2 && <ConversationCompleteBorrowPencil onComplete={advance} />}
          {step === 3 && <WordProblemPencils onComplete={advance} />}
          {step === 4 && <PatternPuzzleBlueGreen onComplete={advance} />}
          {step === 5 && <RealLifeProblemsNotebookUpload onComplete={notebookComplete} />}
        </>
      )}
    />
  );
}
