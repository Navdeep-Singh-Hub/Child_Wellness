/** OT Level 8 · Session 6 · Game 1 — Jungle Path */
import { ObstacleNavGame } from '@/components/game/occupational/level8/session6/ObstacleNavGame';
import React from 'react';

const JunglePathGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ObstacleNavGame {...props} mode="junglePath" />
);

export default JunglePathGame;
