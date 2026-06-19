/** OT Level 8 · Session 2 · Game 2 — Touch Then Turn */
import { TwoStepPlanGame } from '@/components/game/occupational/level8/session2/TwoStepPlanGame';
import React from 'react';

const TouchThenTurnGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <TwoStepPlanGame {...props} mode="touchThenTurn" />
);

export default TouchThenTurnGame;
