/**
 * Level 6 – The Logic Lab, Session 7: Mixed Prepositions Review
 */
import React from 'react';
import { DragPositionReview } from './DragPositionReview';
import { PatternRecognitionReview } from './PatternRecognitionReview';
import { PrepositionQuizReview } from './PrepositionQuizReview';
import { PrepositionReviewNotebookUpload } from './PrepositionReviewNotebookUpload';
import { SequencePuzzleReview } from './SequencePuzzleReview';
import { LogicLabSessionFlow } from './shared/LogicLabSessionFlow';
import { LOGIC_LAB_SESSIONS } from './shared/logicLabSessionConfigs';

interface PrepositionReviewSession7Props {
  onExit?: () => void;
}

export function PrepositionReviewSession7({ onExit }: PrepositionReviewSession7Props = {}) {
  return (
    <LogicLabSessionFlow
      config={LOGIC_LAB_SESSIONS[7]}
      onExit={onExit}
      renderGame={(step, advance, notebookComplete) => {
        switch (step) {
          case 1:
            return <PrepositionQuizReview onComplete={advance} />;
          case 2:
            return <DragPositionReview onComplete={advance} />;
          case 3:
            return <PatternRecognitionReview onComplete={advance} />;
          case 4:
            return <SequencePuzzleReview onComplete={advance} />;
          case 5:
            return <PrepositionReviewNotebookUpload onComplete={notebookComplete} />;
          default:
            return null;
        }
      }}
    />
  );
}
