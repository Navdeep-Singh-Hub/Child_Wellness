/** OT Level 8 · Session 2 · Game 3 — Reach Then Freeze */
import { TwoStepPlanGame } from '@/components/game/occupational/level8/session2/TwoStepPlanGame';
import React from 'react';

const ReachThenFreezeGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <TwoStepPlanGame {...props} mode="reachThenFreeze" />
);

export default ReachThenFreezeGame;
