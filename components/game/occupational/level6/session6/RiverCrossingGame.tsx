/** OT Level 6 · Session 6 · Game 3 — River Crossing */
import { DynamicBalanceGame } from '@/components/game/occupational/level6/session6/DynamicBalanceGame';
import React from 'react';

const RiverCrossingGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DynamicBalanceGame {...props} mode="riverCrossing" />
);

export default RiverCrossingGame;
