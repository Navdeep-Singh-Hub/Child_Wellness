/**
 * Level 10 – The Graduate, Session 5: Social Dialogue
 */
import { GRADUATE_SESSIONS } from '@/components/graduate-session/shared/graduateSessionConfigs';
import { GraduateSessionFlow } from '@/components/graduate-session/shared/GraduateSessionFlow';
import React from 'react';
import { GreetingChoice } from './GreetingChoice';
import { DialogueMatchThankYou } from './DialogueMatchThankYou';
import { WordProblemDogs } from './WordProblemDogs';
import { PatternPuzzleColors } from './PatternPuzzleColors';
import { SocialDialogueNotebookUpload } from './SocialDialogueNotebookUpload';

interface SocialDialogueSession5Props {
  onExit?: () => void;
}

export function SocialDialogueSession5({ onExit }: SocialDialogueSession5Props = {}) {
  const config = GRADUATE_SESSIONS[5];

  return (
    <GraduateSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, notebookComplete) => (
        <>
          {step === 1 && <GreetingChoice onComplete={advance} />}
          {step === 2 && <DialogueMatchThankYou onComplete={advance} />}
          {step === 3 && <WordProblemDogs onComplete={advance} />}
          {step === 4 && <PatternPuzzleColors onComplete={advance} />}
          {step === 5 && <SocialDialogueNotebookUpload onComplete={notebookComplete} />}
        </>
      )}
    />
  );
}
