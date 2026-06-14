/** OT Level 6 · Session 5 · Game 4 — Bridge Balance */
import { WeightShiftGame } from '@/components/game/occupational/level6/session5/WeightShiftGame';
import React from 'react';

const BridgeBalanceGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <WeightShiftGame {...props} mode="bridge" />
);

export default BridgeBalanceGame;
