/** OT Level 7 · Session 1 · Game 3 — Rainbow Run */
import { LinearMovementGame } from '@/components/game/occupational/level7/session1/LinearMovementGame';
import React from 'react';

const RainbowRunGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <LinearMovementGame {...props} mode="rainbowRun" />
);

export default RainbowRunGame;
