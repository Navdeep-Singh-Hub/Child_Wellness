/**
 * Level 8 – The Citizen, Session 2: Public Place Signs
 */
import { CITIZEN_SESSIONS } from '@/components/citizen-session/shared/citizenSessionConfigs';
import { CitizenSessionFlow } from '@/components/citizen-session/shared/CitizenSessionFlow';
import React from 'react';
import { PublicSignRecognition } from './PublicSignRecognition';
import { PublicSignMeaningMatch } from './PublicSignMeaningMatch';
import { CoinValueMatch } from './CoinValueMatch';
import { CoinValueBuilder } from './CoinValueBuilder';
import { PublicPlaceSignsNotebookUpload } from './PublicPlaceSignsNotebookUpload';

interface PublicPlaceSignsSession2Props {
  onExit?: () => void;
}

export function PublicPlaceSignsSession2({ onExit }: PublicPlaceSignsSession2Props = {}) {
  const config = CITIZEN_SESSIONS[2];

  return (
    <CitizenSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, notebookComplete) => (
        <>
          {step === 1 && <PublicSignRecognition onComplete={advance} />}
          {step === 2 && <PublicSignMeaningMatch onComplete={advance} />}
          {step === 3 && <CoinValueMatch onComplete={advance} />}
          {step === 4 && <CoinValueBuilder onComplete={advance} />}
          {step === 5 && <PublicPlaceSignsNotebookUpload onComplete={notebookComplete} />}
        </>
      )}
    />
  );
}
