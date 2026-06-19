/** OT Level 8 · Session 5 · Game 4 — Turn Position */
import { BodyPositionGame } from '@/components/game/occupational/level8/session5/BodyPositionGame';
import React from 'react';

const TurnPositionGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <BodyPositionGame {...props} mode="turnPosition" />
);

export default TurnPositionGame;
