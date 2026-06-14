/** OT Level 7 · Session 2 · Game 3 — Helicopter Watch */
import { VestibularHeadGame } from '@/components/game/occupational/level7/session2/VestibularHeadGame';
import React from 'react';

const HelicopterWatchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <VestibularHeadGame {...props} mode="helicopterWatch" />
);

export default HelicopterWatchGame;
