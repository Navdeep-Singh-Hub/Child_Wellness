/** OT Level 6 · Session 7 · Game 3 — Target Spiral */
import { TrunkRotationGame } from '@/components/game/occupational/level6/session7/TrunkRotationGame';
import React from 'react';

const TargetSpiralGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <TrunkRotationGame {...props} mode="turnTouch" />
);

export default TargetSpiralGame;
