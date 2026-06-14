/** OT Level 6 · Session 7 · Game 3 — Turn & Touch */
import { TrunkRotationGame } from '@/components/game/occupational/level6/session7/TrunkRotationGame';
import React from 'react';

const TurnAndTouchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <TrunkRotationGame {...props} mode="turnTouch" />
);

export default TurnAndTouchGame;
