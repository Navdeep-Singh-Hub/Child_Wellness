/** OT Level 8 · Session 7 · Game 3 — Bear Pattern */
import { BilateralPlanGame } from '@/components/game/occupational/level8/session7/BilateralPlanGame';
import React from 'react';

const BearPatternGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <BilateralPlanGame {...props} mode="bearPattern" />
);

export default BearPatternGame;
