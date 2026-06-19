/** OT Level 8 · Session 6 · Game 4 — Space Maze */
import { ObstacleNavGame } from '@/components/game/occupational/level8/session6/ObstacleNavGame';
import React from 'react';

const SpaceMazeGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ObstacleNavGame {...props} mode="spaceMaze" />
);

export default SpaceMazeGame;
