/** OT Level 7 · Session 4 · Game 1 — Tornado Turn */
import { RotationalProcessingGame } from '@/components/game/occupational/level7/session4/RotationalProcessingGame';
import React from 'react';

const TornadoTurnGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <RotationalProcessingGame {...props} mode="tornadoTurn" />
);

export default TornadoTurnGame;
