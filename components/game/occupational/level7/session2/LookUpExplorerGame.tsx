/** OT Level 7 · Session 2 · Game 1 — Look Up Explorer */
import { VestibularHeadGame } from '@/components/game/occupational/level7/session2/VestibularHeadGame';
import React from 'react';

const LookUpExplorerGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <VestibularHeadGame {...props} mode="lookUpExplorer" />
);

export default LookUpExplorerGame;
