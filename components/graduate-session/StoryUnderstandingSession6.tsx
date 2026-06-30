/**
 * Level 10 – The Graduate, Session 6: Story Understanding
 */
import { GRADUATE_SESSIONS } from '@/components/graduate-session/shared/graduateSessionConfigs';
import { GraduateSessionFlow } from '@/components/graduate-session/shared/GraduateSessionFlow';
import React from 'react';
import { StoryQuestionBall } from './StoryQuestionBall';
import { DialogueMatchSitDown } from './DialogueMatchSitDown';
import { WordProblemCookies } from './WordProblemCookies';
import { SizeSortingGame } from './SizeSortingGame';
import { StoryUnderstandingNotebookUpload } from './StoryUnderstandingNotebookUpload';

interface StoryUnderstandingSession6Props {
  onExit?: () => void;
}

export function StoryUnderstandingSession6({ onExit }: StoryUnderstandingSession6Props = {}) {
  const config = GRADUATE_SESSIONS[6];

  return (
    <GraduateSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, notebookComplete) => (
        <>
          {step === 1 && <StoryQuestionBall onComplete={advance} />}
          {step === 2 && <DialogueMatchSitDown onComplete={advance} />}
          {step === 3 && <WordProblemCookies onComplete={advance} />}
          {step === 4 && <SizeSortingGame onComplete={advance} />}
          {step === 5 && <StoryUnderstandingNotebookUpload onComplete={notebookComplete} />}
        </>
      )}
    />
  );
}
