/**
 * Level 8 – The Citizen, Session 9: Community Signs
 */
import { CITIZEN_SESSIONS } from '@/components/citizen-session/shared/citizenSessionConfigs';
import { CitizenSessionFlow } from '@/components/citizen-session/shared/CitizenSessionFlow';
import React from 'react';
import { CommunitySignRecognition } from './CommunitySignRecognition';
import { CommunitySignMeaningMatch } from './CommunitySignMeaningMatch';
import { CommunityCoinTotal } from './CommunityCoinTotal';
import { BuyBusTicketGame } from './BuyBusTicketGame';
import { CommunitySignsNotebookUpload } from './CommunitySignsNotebookUpload';

interface CommunitySignsSession9Props {
  onExit?: () => void;
}

export function CommunitySignsSession9({ onExit }: CommunitySignsSession9Props = {}) {
  const config = CITIZEN_SESSIONS[9];

  return (
    <CitizenSessionFlow
      config={config}
      onExit={onExit}
      renderGame={(step, advance, notebookComplete) => (
        <>
          {step === 1 && <CommunitySignRecognition onComplete={advance} />}
          {step === 2 && <CommunitySignMeaningMatch onComplete={advance} />}
          {step === 3 && <CommunityCoinTotal onComplete={advance} />}
          {step === 4 && <BuyBusTicketGame onComplete={advance} />}
          {step === 5 && <CommunitySignsNotebookUpload onComplete={notebookComplete} />}
        </>
      )}
    />
  );
}
