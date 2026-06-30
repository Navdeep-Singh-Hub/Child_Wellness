/**
 * Level 10 – The Graduate, Session 4: Daily Stories
 */
import { GRADUATE_SESSIONS } from '@/components/graduate-session/shared/graduateSessionConfigs';
import { GraduateSessionFlow } from '@/components/graduate-session/shared/GraduateSessionFlow';
import React from 'react';
import { PictureSentenceBrushTeeth } from './PictureSentenceBrushTeeth';
import { DialogueCompleteLetsPlay } from './DialogueCompleteLetsPlay';
import { WordProblemBalloons } from './WordProblemBalloons';
import { LogicSequenceSunMoon } from './LogicSequenceSunMoon';
import { DailyStoriesNotebookUpload } from './DailyStoriesNotebookUpload';

interface DailyStoriesSession4Props {
  onExit?: () => void;
}

export function DailyStoriesSession4({ onExit }: DailyStoriesSession4Props = {}) {
  const config = GRADUATE_SESSIONS[4];

  return (
    <GraduateSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, notebookComplete) => (
        <>
          {step === 1 && <PictureSentenceBrushTeeth onComplete={advance} />}
          {step === 2 && <DialogueCompleteLetsPlay onComplete={advance} />}
          {step === 3 && <WordProblemBalloons onComplete={advance} />}
          {step === 4 && <LogicSequenceSunMoon onComplete={advance} />}
          {step === 5 && <DailyStoriesNotebookUpload onComplete={notebookComplete} />}
        </>
      )}
    />
  );
}
