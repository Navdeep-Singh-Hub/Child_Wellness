/** OT Level 7 · Session 3 · Game 1 — Direction Switch */
import { DirectionChangeGame } from '@/components/game/occupational/level7/session3/DirectionChangeGame';
import React from 'react';

const DirectionSwitchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <DirectionChangeGame {...props} mode="directionSwitch" />
);

export default DirectionSwitchGame;
