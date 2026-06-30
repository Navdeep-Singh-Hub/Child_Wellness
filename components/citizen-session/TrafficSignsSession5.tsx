/**
 * Level 8 – The Citizen, Session 5: Traffic Signs
 */
import { CITIZEN_SESSIONS } from '@/components/citizen-session/shared/citizenSessionConfigs';
import { CitizenSessionFlow } from '@/components/citizen-session/shared/CitizenSessionFlow';
import React from 'react';
import { TrafficSignRecognition } from './TrafficSignRecognition';
import { TrafficSignMeaningMatch } from './TrafficSignMeaningMatch';
import { TrafficCoinCounting } from './TrafficCoinCounting';
import { ParkingPayment } from './ParkingPayment';
import { TrafficSignsNotebookUpload } from './TrafficSignsNotebookUpload';

interface TrafficSignsSession5Props {
  onExit?: () => void;
}

export function TrafficSignsSession5({ onExit }: TrafficSignsSession5Props = {}) {
  const config = CITIZEN_SESSIONS[5];

  return (
    <CitizenSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, notebookComplete) => (
        <>
          {step === 1 && <TrafficSignRecognition onComplete={advance} />}
          {step === 2 && <TrafficSignMeaningMatch onComplete={advance} />}
          {step === 3 && <TrafficCoinCounting onComplete={advance} />}
          {step === 4 && <ParkingPayment onComplete={advance} />}
          {step === 5 && <TrafficSignsNotebookUpload onComplete={notebookComplete} />}
        </>
      )}
    />
  );
}
