/**
 * Level 8 – The Citizen, Session 1: Safety Signs
 */
import { CITIZEN_SESSIONS } from '@/components/citizen-session/shared/citizenSessionConfigs';
import { CitizenSessionFlow } from '@/components/citizen-session/shared/CitizenSessionFlow';
import React from 'react';
import { SignRecognition } from './SignRecognition';
import { SignMeaningMatch } from './SignMeaningMatch';
import { CoinRecognition } from './CoinRecognition';
import { CoinCounting } from './CoinCounting';
import { SafetySignsNotebookUpload } from './SafetySignsNotebookUpload';

interface SafetySignsSession1Props {
  onExit?: () => void;
}

export function SafetySignsSession1({ onExit }: SafetySignsSession1Props = {}) {
  const config = CITIZEN_SESSIONS[1];

  return (
    <CitizenSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, notebookComplete) => (
        <>
          {step === 1 && <SignRecognition onComplete={advance} />}
          {step === 2 && <SignMeaningMatch onComplete={advance} />}
          {step === 3 && <CoinRecognition onComplete={advance} />}
          {step === 4 && <CoinCounting onComplete={advance} />}
          {step === 5 && <SafetySignsNotebookUpload onComplete={notebookComplete} />}
        </>
      )}
    />
  );
}
