/**
 * Level 10 – The Graduate, Session 1: Simple Conversations
 */
import { GRADUATE_SESSIONS } from '@/components/graduate-session/shared/graduateSessionConfigs';
import { GraduateSessionFlow } from '@/components/graduate-session/shared/GraduateSessionFlow';
import React from 'react';
import { CompleteDialogue } from './CompleteDialogue';
import { ReplyChoice } from './ReplyChoice';
import { WordProblemGame } from './WordProblemGame';
import { PatternPuzzle } from './PatternPuzzle';
import { GraduateConversationNotebookUpload } from './GraduateConversationNotebookUpload';

interface SimpleConversationsSession1Props {
  onExit?: () => void;
}

export function SimpleConversationsSession1({ onExit }: SimpleConversationsSession1Props = {}) {
  const config = GRADUATE_SESSIONS[1];

  return (
    <GraduateSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, notebookComplete) => (
        <>
          {step === 1 && <CompleteDialogue onComplete={advance} />}
          {step === 2 && <ReplyChoice onComplete={advance} />}
          {step === 3 && <WordProblemGame onComplete={advance} />}
          {step === 4 && <PatternPuzzle onComplete={advance} />}
          {step === 5 && <GraduateConversationNotebookUpload onComplete={notebookComplete} />}
        </>
      )}
    />
  );
}
