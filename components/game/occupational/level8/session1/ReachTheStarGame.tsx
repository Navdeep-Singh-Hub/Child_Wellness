/** OT Level 8 · Session 1 · Game 2 — Reach The Star */
import { MotorPlanGame } from '@/components/game/occupational/level8/session1/MotorPlanGame';
import React from 'react';

const ReachTheStarGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MotorPlanGame {...props} mode="reachStar" />
);

export default ReachTheStarGame;
