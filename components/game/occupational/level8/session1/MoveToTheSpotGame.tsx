/** OT Level 8 · Session 1 · Game 3 — Move To The Spot */
import { MotorPlanGame } from '@/components/game/occupational/level8/session1/MotorPlanGame';
import React from 'react';

const MoveToTheSpotGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MotorPlanGame {...props} mode="moveToSpot" />
);

export default MoveToTheSpotGame;
