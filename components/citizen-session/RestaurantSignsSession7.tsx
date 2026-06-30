/**
 * Level 8 – The Citizen, Session 7: Restaurant Signs
 */
import { CITIZEN_SESSIONS } from '@/components/citizen-session/shared/citizenSessionConfigs';
import { CitizenSessionFlow } from '@/components/citizen-session/shared/CitizenSessionFlow';
import React from 'react';
import { RestaurantSignRecognition } from './RestaurantSignRecognition';
import { RestaurantSignMeaningMatch } from './RestaurantSignMeaningMatch';
import { RestaurantCoinValueTap } from './RestaurantCoinValueTap';
import { PayJuiceGame } from './PayJuiceGame';
import { RestaurantSignsNotebookUpload } from './RestaurantSignsNotebookUpload';

interface RestaurantSignsSession7Props {
  onExit?: () => void;
}

export function RestaurantSignsSession7({ onExit }: RestaurantSignsSession7Props = {}) {
  const config = CITIZEN_SESSIONS[7];

  return (
    <CitizenSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, notebookComplete) => (
        <>
          {step === 1 && <RestaurantSignRecognition onComplete={advance} />}
          {step === 2 && <RestaurantSignMeaningMatch onComplete={advance} />}
          {step === 3 && <RestaurantCoinValueTap onComplete={advance} />}
          {step === 4 && <PayJuiceGame onComplete={advance} />}
          {step === 5 && <RestaurantSignsNotebookUpload onComplete={notebookComplete} />}
        </>
      )}
    />
  );
}
