/**
 * Level 10 – The Graduate, Session 3: Question & Answer
 */
import { GRADUATE_SESSIONS } from '@/components/graduate-session/shared/graduateSessionConfigs';
import { GraduateSessionFlow } from '@/components/graduate-session/shared/GraduateSessionFlow';
import React from 'react';
import { QuestionChoice } from './QuestionChoice';
import { DialogueCompleteEatFood } from './DialogueCompleteEatFood';
import { WordProblemCandies } from './WordProblemCandies';
import { LogicSortingFoodAnimals } from './LogicSortingFoodAnimals';
import { QuestionAnswerNotebookUpload } from './QuestionAnswerNotebookUpload';

interface QuestionAnswerSession3Props {
  onExit?: () => void;
}

export function QuestionAnswerSession3({ onExit }: QuestionAnswerSession3Props = {}) {
  const config = GRADUATE_SESSIONS[3];

  return (
    <GraduateSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, notebookComplete) => (
        <>
          {step === 1 && <QuestionChoice onComplete={advance} />}
          {step === 2 && <DialogueCompleteEatFood onComplete={advance} />}
          {step === 3 && <WordProblemCandies onComplete={advance} />}
          {step === 4 && <LogicSortingFoodAnimals onComplete={advance} />}
          {step === 5 && <QuestionAnswerNotebookUpload onComplete={notebookComplete} />}
        </>
      )}
    />
  );
}
