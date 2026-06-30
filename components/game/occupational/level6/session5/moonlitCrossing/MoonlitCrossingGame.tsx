/** OT Level 6 · Session 5 · Game 4 — Moonlit Crossing */
import { WeightShiftGame } from '@/components/game/occupational/level6/session5/WeightShiftGame';
import React from 'react';

const MoonlitCrossingGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <WeightShiftGame {...props} mode="bridge" />
);

export default MoonlitCrossingGame;
