/** OT Level 7 · Session 1 · Game 2 — Rocket Launch */
import { LinearMovementGame } from '@/components/game/occupational/level7/session1/LinearMovementGame';
import React from 'react';

const RocketLaunchGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <LinearMovementGame {...props} mode="rocketLaunch" />
);

export default RocketLaunchGame;
