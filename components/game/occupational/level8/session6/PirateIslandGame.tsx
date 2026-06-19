/** OT Level 8 · Session 6 · Game 5 — Pirate Island */
import { ObstacleNavGame } from '@/components/game/occupational/level8/session6/ObstacleNavGame';
import React from 'react';

const PirateIslandGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ObstacleNavGame {...props} mode="pirateIsland" />
);

export default PirateIslandGame;
