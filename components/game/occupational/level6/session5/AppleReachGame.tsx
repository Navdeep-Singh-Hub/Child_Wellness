/** OT Level 6 · Session 5 · Game 1 — Apple Reach */
import { WeightShiftGame } from '@/components/game/occupational/level6/session5/WeightShiftGame';
import React from 'react';

const AppleReachGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <WeightShiftGame {...props} mode="appleReach" />
);

export default AppleReachGame;
