/**
 * Level 8 – The Citizen, Session 6: School Signs
 */
import { CITIZEN_SESSIONS } from '@/components/citizen-session/shared/citizenSessionConfigs';
import { CitizenSessionFlow } from '@/components/citizen-session/shared/CitizenSessionFlow';
import React from 'react';
import { SchoolSignRecognition } from './SchoolSignRecognition';
import { SchoolIconPlaceMatch } from './SchoolIconPlaceMatch';
import { CoinSorting } from './CoinSorting';
import { BuyPencilGame } from './BuyPencilGame';
import { SchoolSignsNotebookUpload } from './SchoolSignsNotebookUpload';

interface SchoolSignsSession6Props {
  onExit?: () => void;
}

export function SchoolSignsSession6({ onExit }: SchoolSignsSession6Props = {}) {
  const config = CITIZEN_SESSIONS[6];

  return (
    <CitizenSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, notebookComplete) => (
        <>
          {step === 1 && <SchoolSignRecognition onComplete={advance} />}
          {step === 2 && <SchoolIconPlaceMatch onComplete={advance} />}
          {step === 3 && <CoinSorting onComplete={advance} />}
          {step === 4 && <BuyPencilGame onComplete={advance} />}
          {step === 5 && <SchoolSignsNotebookUpload onComplete={notebookComplete} />}
        </>
      )}
    />
  );
}
