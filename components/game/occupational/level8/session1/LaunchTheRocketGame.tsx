/** OT Level 8 · Session 1 · Game 4 — Launch The Rocket */
import { MotorPlanGame } from '@/components/game/occupational/level8/session1/MotorPlanGame';
import React from 'react';

const LaunchTheRocketGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <MotorPlanGame {...props} mode="launchRocket" />
);

export default LaunchTheRocketGame;
