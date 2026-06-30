/** OT Level 6 · Session 6 · Game 1 — Boulder Ford */
import { DynamicBalanceGame } from '@/components/game/occupational/level6/session6/DynamicBalanceGame';
import React from 'react';

const BoulderFordGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DynamicBalanceGame {...props} mode="steppingStones" />
);

export default BoulderFordGame;
