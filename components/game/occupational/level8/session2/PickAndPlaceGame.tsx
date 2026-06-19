/** OT Level 8 · Session 2 · Game 5 — Pick And Place */
import { TwoStepPlanGame } from '@/components/game/occupational/level8/session2/TwoStepPlanGame';
import React from 'react';

const PickAndPlaceGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <TwoStepPlanGame {...props} mode="pickAndPlace" />
);

export default PickAndPlaceGame;
