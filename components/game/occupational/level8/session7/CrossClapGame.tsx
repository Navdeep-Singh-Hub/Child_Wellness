/** OT Level 8 · Session 7 · Game 2 — Cross Clap */
import { BilateralPlanGame } from '@/components/game/occupational/level8/session7/BilateralPlanGame';
import React from 'react';

const CrossClapGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <BilateralPlanGame {...props} mode="crossClap" />
);

export default CrossClapGame;
