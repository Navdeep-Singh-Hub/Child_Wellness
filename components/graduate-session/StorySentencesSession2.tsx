/**
 * Level 10 – The Graduate, Session 2: Story Sentences
 */
import { GRADUATE_SESSIONS } from '@/components/graduate-session/shared/graduateSessionConfigs';
import { GraduateSessionFlow } from '@/components/graduate-session/shared/GraduateSessionFlow';
import React from 'react';
import { SentenceArrange } from './SentenceArrange';
import { DialogueChoiceStory } from './DialogueChoiceStory';
import { WordProblemBirds } from './WordProblemBirds';
import { PatternPuzzleShapes } from './PatternPuzzleShapes';
import { StorySentencesNotebookUpload } from './StorySentencesNotebookUpload';

interface StorySentencesSession2Props {
  onExit?: () => void;
}

export function StorySentencesSession2({ onExit }: StorySentencesSession2Props = {}) {
  const config = GRADUATE_SESSIONS[2];

  return (
    <GraduateSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, notebookComplete) => (
        <>
          {step === 1 && <SentenceArrange onComplete={advance} />}
          {step === 2 && <DialogueChoiceStory onComplete={advance} />}
          {step === 3 && <WordProblemBirds onComplete={advance} />}
          {step === 4 && <PatternPuzzleShapes onComplete={advance} />}
          {step === 5 && <StorySentencesNotebookUpload onComplete={notebookComplete} />}
        </>
      )}
    />
  );
}
