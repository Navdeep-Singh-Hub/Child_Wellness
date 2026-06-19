/** OT Level 8 · Session 7 · Game 5 — Dual Action */
import { BilateralPlanGame } from '@/components/game/occupational/level8/session7/BilateralPlanGame';
import React from 'react';

const DualActionGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <BilateralPlanGame {...props} mode="dualAction" />
);

export default DualActionGame;
