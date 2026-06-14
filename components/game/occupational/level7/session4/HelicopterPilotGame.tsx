/** OT Level 7 · Session 4 · Game 3 — Helicopter Pilot */
import { RotationalProcessingGame } from '@/components/game/occupational/level7/session4/RotationalProcessingGame';
import React from 'react';

const HelicopterPilotGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <RotationalProcessingGame {...props} mode="helicopterPilot" />
);

export default HelicopterPilotGame;
