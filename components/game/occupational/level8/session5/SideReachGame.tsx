/** OT Level 8 · Session 5 · Game 3 — Side Reach */
import { BodyPositionGame } from '@/components/game/occupational/level8/session5/BodyPositionGame';
import React from 'react';

const SideReachGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <BodyPositionGame {...props} mode="sideReach" />
);

export default SideReachGame;
