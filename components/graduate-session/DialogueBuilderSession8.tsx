/**
 * Level 10 – The Graduate, Session 8: Dialogue Builder
 */
import { GRADUATE_SESSIONS } from '@/components/graduate-session/shared/graduateSessionConfigs';
import { GraduateSessionFlow } from '@/components/graduate-session/shared/GraduateSessionFlow';
import React from 'react';
import { DialogueArrangeHello } from './DialogueArrangeHello';
import { ReplyChoiceWantToPlay } from './ReplyChoiceWantToPlay';
import { WordProblemApples } from './WordProblemApples';
import { LogicSequenceStarBlue } from './LogicSequenceStarBlue';
import { DialogueBuilderNotebookUpload } from './DialogueBuilderNotebookUpload';

interface DialogueBuilderSession8Props {
  onExit?: () => void;
}

export function DialogueBuilderSession8({ onExit }: DialogueBuilderSession8Props = {}) {
  const config = GRADUATE_SESSIONS[8];

  return (
    <GraduateSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, notebookComplete) => (
        <>
          {step === 1 && <DialogueArrangeHello onComplete={advance} />}
          {step === 2 && <ReplyChoiceWantToPlay onComplete={advance} />}
          {step === 3 && <WordProblemApples onComplete={advance} />}
          {step === 4 && <LogicSequenceStarBlue onComplete={advance} />}
          {step === 5 && <DialogueBuilderNotebookUpload onComplete={notebookComplete} />}
        </>
      )}
    />
  );
}
