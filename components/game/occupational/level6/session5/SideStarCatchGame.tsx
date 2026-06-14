/** OT Level 6 · Session 5 · Game 2 — Side Star Catch */
import { WeightShiftGame } from '@/components/game/occupational/level6/session5/WeightShiftGame';
import React from 'react';

const SideStarCatchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <WeightShiftGame {...props} mode="sideStar" />
);

export default SideStarCatchGame;
