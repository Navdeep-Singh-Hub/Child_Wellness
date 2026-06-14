/** OT Level 7 · Session 1 · Game 5 — Adventure Path */
import { LinearMovementGame } from '@/components/game/occupational/level7/session1/LinearMovementGame';
import React from 'react';

const AdventurePathGame: React.FC<{ onBack?: () => void; onComplete?: () => void }> = (props) => (
  <LinearMovementGame {...props} mode="adventurePath" />
);

export default AdventurePathGame;
