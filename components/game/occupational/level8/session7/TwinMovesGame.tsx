/** OT Level 8 · Session 7 · Game 1 — Twin Moves */
import { BilateralPlanGame } from '@/components/game/occupational/level8/session7/BilateralPlanGame';
import React from 'react';

const TwinMovesGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <BilateralPlanGame {...props} mode="twinMoves" />
);

export default TwinMovesGame;
