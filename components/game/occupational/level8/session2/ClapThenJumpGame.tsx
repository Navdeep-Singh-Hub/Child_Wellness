/** OT Level 8 · Session 2 · Game 1 — Clap Then Jump */
import { TwoStepPlanGame } from '@/components/game/occupational/level8/session2/TwoStepPlanGame';
import React from 'react';

const ClapThenJumpGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <TwoStepPlanGame {...props} mode="clapThenJump" />
);

export default ClapThenJumpGame;
