/** OT Level 7 · Session 2 · Game 5 — Turn & Find */
import { VestibularHeadGame } from '@/components/game/occupational/level7/session2/VestibularHeadGame';
import React from 'react';

const TurnAndFindGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <VestibularHeadGame {...props} mode="turnAndFind" />
);

export default TurnAndFindGame;
