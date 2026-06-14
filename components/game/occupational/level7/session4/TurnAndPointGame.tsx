/** OT Level 7 · Session 4 · Game 5 — Turn & Point */
import { RotationalProcessingGame } from '@/components/game/occupational/level7/session4/RotationalProcessingGame';
import React from 'react';

const TurnAndPointGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <RotationalProcessingGame {...props} mode="turnAndPoint" />
);

export default TurnAndPointGame;
