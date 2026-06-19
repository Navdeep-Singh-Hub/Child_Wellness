/** OT Level 8 · Session 6 · Game 3 — Mountain Route */
import { ObstacleNavGame } from '@/components/game/occupational/level8/session6/ObstacleNavGame';
import React from 'react';

const MountainRouteGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ObstacleNavGame {...props} mode="mountainRoute" />
);

export default MountainRouteGame;
