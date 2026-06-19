/** OT Level 8 · Session 5 · Game 2 — Low Reach */
import { BodyPositionGame } from '@/components/game/occupational/level8/session5/BodyPositionGame';
import React from 'react';

const LowReachGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <BodyPositionGame {...props} mode="lowReach" />
);

export default LowReachGame;
