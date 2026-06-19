/** OT Level 8 · Session 6 · Game 2 — Lava Escape */
import { ObstacleNavGame } from '@/components/game/occupational/level8/session6/ObstacleNavGame';
import React from 'react';

const LavaEscapeGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <ObstacleNavGame {...props} mode="lavaEscape" />
);

export default LavaEscapeGame;
