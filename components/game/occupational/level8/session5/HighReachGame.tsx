/** OT Level 8 · Session 5 · Game 1 — High Reach */
import { BodyPositionGame } from '@/components/game/occupational/level8/session5/BodyPositionGame';
import React from 'react';

const HighReachGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <BodyPositionGame {...props} mode="highReach" />
);

export default HighReachGame;
