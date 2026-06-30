/**
 * Level 8 – The Citizen, Session 4: Store Signs
 */
import { CITIZEN_SESSIONS } from '@/components/citizen-session/shared/citizenSessionConfigs';
import { CitizenSessionFlow } from '@/components/citizen-session/shared/CitizenSessionFlow';
import React from 'react';
import { StoreSignRecognition } from './StoreSignRecognition';
import { StoreSignMeaningMatch } from './StoreSignMeaningMatch';
import { PriceTagRecognition } from './PriceTagRecognition';
import { BuyToyGame } from './BuyToyGame';
import { StoreSignsNotebookUpload } from './StoreSignsNotebookUpload';

interface StoreSignsSession4Props {
  onExit?: () => void;
}

export function StoreSignsSession4({ onExit }: StoreSignsSession4Props = {}) {
  const config = CITIZEN_SESSIONS[4];

  return (
    <CitizenSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, notebookComplete) => (
        <>
          {step === 1 && <StoreSignRecognition onComplete={advance} />}
          {step === 2 && <StoreSignMeaningMatch onComplete={advance} />}
          {step === 3 && <PriceTagRecognition onComplete={advance} />}
          {step === 4 && <BuyToyGame onComplete={advance} />}
          {step === 5 && <StoreSignsNotebookUpload onComplete={notebookComplete} />}
        </>
      )}
    />
  );
}
