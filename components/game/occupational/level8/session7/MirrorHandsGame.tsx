/** OT Level 8 · Session 7 · Game 4 — Mirror Hands */
import { BilateralPlanGame } from '@/components/game/occupational/level8/session7/BilateralPlanGame';
import React from 'react';

const MirrorHandsGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <BilateralPlanGame {...props} mode="mirrorHands" />
);

export default MirrorHandsGame;
