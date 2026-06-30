/**
 * Level 8 – The Citizen, Session 3: Direction Signs
 */
import { CITIZEN_SESSIONS } from '@/components/citizen-session/shared/citizenSessionConfigs';
import { CitizenSessionFlow } from '@/components/citizen-session/shared/CitizenSessionFlow';
import React from 'react';
import { DirectionSignRecognition } from './DirectionSignRecognition';
import { DirectionSignMeaningMatch } from './DirectionSignMeaningMatch';
import { CoinSorting } from './CoinSorting';
import { BuyItemGame } from './BuyItemGame';
import { DirectionSignsNotebookUpload } from './DirectionSignsNotebookUpload';

interface DirectionSignsSession3Props {
  onExit?: () => void;
}

export function DirectionSignsSession3({ onExit }: DirectionSignsSession3Props = {}) {
  const config = CITIZEN_SESSIONS[3];

  return (
    <CitizenSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, notebookComplete) => (
        <>
          {step === 1 && <DirectionSignRecognition onComplete={advance} />}
          {step === 2 && <DirectionSignMeaningMatch onComplete={advance} />}
          {step === 3 && <CoinSorting onComplete={advance} />}
          {step === 4 && <BuyItemGame onComplete={advance} />}
          {step === 5 && <DirectionSignsNotebookUpload onComplete={notebookComplete} />}
        </>
      )}
    />
  );
}
