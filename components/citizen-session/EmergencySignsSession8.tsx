/**
 * Level 8 – The Citizen, Session 8: Emergency Signs
 */
import { CITIZEN_SESSIONS } from '@/components/citizen-session/shared/citizenSessionConfigs';
import { CitizenSessionFlow } from '@/components/citizen-session/shared/CitizenSessionFlow';
import React from 'react';
import { EmergencySignRecognition } from './EmergencySignRecognition';
import { EmergencySignMeaningMatch } from './EmergencySignMeaningMatch';
import { EmergencyCoinCounting } from './EmergencyCoinCounting';
import { PayWaterGame } from './PayWaterGame';
import { EmergencySignsNotebookUpload } from './EmergencySignsNotebookUpload';

interface EmergencySignsSession8Props {
  onExit?: () => void;
}

export function EmergencySignsSession8({ onExit }: EmergencySignsSession8Props = {}) {
  const config = CITIZEN_SESSIONS[8];

  return (
    <CitizenSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, notebookComplete) => (
        <>
          {step === 1 && <EmergencySignRecognition onComplete={advance} />}
          {step === 2 && <EmergencySignMeaningMatch onComplete={advance} />}
          {step === 3 && <EmergencyCoinCounting onComplete={advance} />}
          {step === 4 && <PayWaterGame onComplete={advance} />}
          {step === 5 && <EmergencySignsNotebookUpload onComplete={notebookComplete} />}
        </>
      )}
    />
  );
}
