/** OT Level 8 · Session 2 · Game 4 — Launch Then Catch */
import { TwoStepPlanGame } from '@/components/game/occupational/level8/session2/TwoStepPlanGame';
import React from 'react';

const LaunchThenCatchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <TwoStepPlanGame {...props} mode="launchThenCatch" />
);

export default LaunchThenCatchGame;
