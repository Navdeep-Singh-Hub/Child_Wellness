/**
 * Level 8 – The Citizen, Session 10: Citizen Master Challenge (finale)
 */
import { CITIZEN_SESSIONS } from '@/components/citizen-session/shared/citizenSessionConfigs';
import { CitizenSessionFlow } from '@/components/citizen-session/shared/CitizenSessionFlow';
import React from 'react';
import { CitizenSignHunt } from './CitizenSignHunt';
import { CitizenMeaningQuiz } from './CitizenMeaningQuiz';
import { CitizenCoinChallenge } from './CitizenCoinChallenge';
import { CitizenStoreSimulation } from './CitizenStoreSimulation';
import { CitizenMasterNotebookUpload } from './CitizenMasterNotebookUpload';

interface CitizenMasterSession10Props {
  onExit?: () => void;
}

export function CitizenMasterSession10({ onExit }: CitizenMasterSession10Props = {}) {
  const config = CITIZEN_SESSIONS[10];

  return (
    <CitizenSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, notebookComplete) => (
        <>
          {step === 1 && <CitizenSignHunt onComplete={advance} />}
          {step === 2 && <CitizenMeaningQuiz onComplete={advance} />}
          {step === 3 && <CitizenCoinChallenge onComplete={advance} />}
          {step === 4 && <CitizenStoreSimulation onComplete={advance} />}
          {step === 5 && <CitizenMasterNotebookUpload onComplete={notebookComplete} />}
        </>
      )}
    />
  );
}
